import { CONTENT_REGISTRY } from '@/content';
import { ProviderError } from '@/lib/providers/errors';
import type { DetectionCandidate } from '@/domain/scan/ScanOutcome';
import type {
  IdentificationInput,
  IdentificationProvider,
  IdentificationResult,
} from './types';

interface PlantNetOpts {
  apiKey: string;
  project: string;
  timeoutMs?: number;
}

interface PlantNetResponse {
  results: Array<{
    score: number;
    species: {
      scientificNameWithoutAuthor: string;
      genus?: { scientificNameWithoutAuthor?: string };
      family?: { scientificNameWithoutAuthor?: string };
      commonNames?: string[];
    };
  }>;
}

// Lookup: scientific name (lowercase) → content.id
const CONTENT_BY_SCIENTIFIC_NAME = new Map(
  CONTENT_REGISTRY.map((c) => [c.scientificName.toLowerCase(), c.id])
);

export class PlantNetProvider implements IdentificationProvider {
  readonly name = 'plantnet';

  constructor(private readonly opts: PlantNetOpts) {}

  async identify(input: IdentificationInput): Promise<IdentificationResult> {
    if (!this.opts.apiKey) {
      throw new ProviderError('not_configured', this.name, 'PLANTNET_API_KEY not set');
    }

    const url = new URL(`https://my-api.plantnet.org/v2/identify/${this.opts.project}`);
    url.searchParams.set('api-key', this.opts.apiKey);
    url.searchParams.set('images', input.imageUrl);
    url.searchParams.set('organs', 'auto');
    url.searchParams.set('lang', input.locale);

    const controller = new AbortController();
    const timeoutMs = this.opts.timeoutMs ?? 8000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(url.toString(), { method: 'GET', signal: controller.signal });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ProviderError('timeout', this.name, `plantnet timeout ${timeoutMs}ms`, err);
      }
      throw new ProviderError('upstream_error', this.name, 'network error', err);
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 429) {
      throw new ProviderError('rate_limit', this.name, 'plantnet rate limit');
    }
    if (!res.ok) {
      throw new ProviderError(
        'upstream_error',
        this.name,
        `plantnet http ${res.status}`
      );
    }

    let payload: PlantNetResponse;
    try {
      payload = (await res.json()) as PlantNetResponse;
    } catch (err) {
      throw new ProviderError('upstream_error', this.name, 'invalid json', err);
    }

    const candidates: DetectionCandidate[] = (payload.results ?? [])
      .slice(0, input.maxCandidates)
      .map((r, i) => {
        const sciName = r.species.scientificNameWithoutAuthor;
        return {
          rank: i + 1,
          scientificName: sciName,
          commonNames: r.species.commonNames ?? [],
          taxonomy: {
            family: r.species.family?.scientificNameWithoutAuthor,
            genus: r.species.genus?.scientificNameWithoutAuthor,
            species: sciName,
          },
          confidence: r.score,
          matchedContentId: CONTENT_BY_SCIENTIFIC_NAME.get(sciName.toLowerCase()),
        };
      });

    return { candidates, providerRaw: payload };
  }
}
