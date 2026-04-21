import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { analyzeImage } from '@/lib/services/analyzeImageService';
import { saveScan } from '@/lib/services/scanRepository';
import { listHistory } from '@/lib/services/historyService';
import { uploadScanImage, createSignedReadUrl } from '@/lib/services/imageStorageService';
import { incrementScanUsage, currentYearMonth } from '@/lib/services/usageCounterService';
import { getIdentificationProvider } from '@/lib/providers/identification/factory';
import { ClaudeVisionTriageProvider } from '@/lib/providers/triage/claudeVision';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const history = await listHistory(user.id);
  return NextResponse.json({ items: history });
}

const MAX_BYTES = 10 * 1024 * 1024;
// Budget-Cap für externe API-Kosten. Kein Paywall-Feature — schützt vor Abuse
// und unkontrollierten Provider-Kosten. Paywall-Enforcement kommt in Phase E.
const MONTHLY_SAFETY_CAP = Number(process.env.SCAN_MONTHLY_SAFETY_CAP ?? 50);

async function deleteUploadedImage(path: string) {
  try {
    const svc = createServiceRoleClient();
    await svc.storage.from('scan-images').remove([path]);
  } catch (e) {
    console.error('cleanup failed for orphaned image', path, e);
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('image');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'no image' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'image too large' }, { status: 413 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'invalid mime' }, { status: 415 });
  }

  // C-3: Cost-Cap vor externen Provider-Calls prüfen.
  const svc = createServiceRoleClient();
  const { data: usage } = await svc
    .from('scan_usage')
    .select('scans_used')
    .eq('user_id', user.id)
    .eq('year_month', currentYearMonth())
    .maybeSingle();
  if ((usage?.scans_used ?? 0) >= MONTHLY_SAFETY_CAP) {
    return NextResponse.json({ error: 'monthly scan cap reached' }, { status: 402 });
  }

  const scanId = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await uploadScanImage({
    userId: user.id,
    scanId,
    buffer,
    mime: file.type,
  });

  // C-1 + C-2: Wrap alles nach dem Upload in try/catch, kurze signed-URL TTL für Provider.
  try {
    const signedUrl = await createSignedReadUrl(uploaded.path, 600); // 10min reichen für synchrone Provider-Calls

    const triage = new ClaudeVisionTriageProvider({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
    const identification = getIdentificationProvider();

    const outcome = await analyzeImage({
      imageUrl: signedUrl,
      triage,
      identification,
    });

    await saveScan({
      userId: user.id,
      scanId,
      imagePath: uploaded.path,
      imageMeta: { bytes: uploaded.bytes, mime: uploaded.mime },
      outcome,
    });
    await incrementScanUsage(user.id).catch((e) => console.error('usage increment failed', e));

    return NextResponse.json({ scanId, status: outcome.status });
  } catch (err) {
    // Upload succeeded but something downstream blew up — clean up the orphan.
    await deleteUploadedImage(uploaded.path);
    console.error('scan pipeline failure', err);
    return NextResponse.json(
      { error: 'scan pipeline failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
