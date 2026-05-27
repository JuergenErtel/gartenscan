import { PlantNetProvider } from './plantnet';
import { MockIdentificationProvider } from './mock';
import { ClaudeMatchProvider } from './claudeMatch';
import type { IdentificationProvider } from './types';
import type { TriageCategory } from '@/domain/scan/ScanOutcome';

export function getIdentificationProvider(): IdentificationProvider {
  if (process.env.IDENTIFICATION_PROVIDER === 'mock') {
    return new MockIdentificationProvider();
  }

  return new PlantNetProvider({
    apiKey: process.env.PLANTNET_API_KEY ?? '',
    project: process.env.PLANTNET_PROJECT ?? 'weurope',
  });
}

export function getIdentificationProviderFor(
  category: TriageCategory
): IdentificationProvider | null {
  if (process.env.IDENTIFICATION_PROVIDER === 'mock') {
    return new MockIdentificationProvider();
  }

  switch (category) {
    case 'plant':
      return new PlantNetProvider({
        apiKey: process.env.PLANTNET_API_KEY ?? '',
        project: process.env.PLANTNET_PROJECT ?? 'weurope',
      });
    case 'insect':
    case 'beneficial':
      return new ClaudeMatchProvider({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        scope: ['PEST', 'BENEFICIAL'],
      });
    case 'disease':
      return new ClaudeMatchProvider({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        scope: ['DISEASE'],
      });
    case 'damage':
      return new ClaudeMatchProvider({
        apiKey: process.env.ANTHROPIC_API_KEY ?? '',
        scope: ['DISEASE', 'PEST'],
      });
    case 'unclear':
      return null;
  }
}
