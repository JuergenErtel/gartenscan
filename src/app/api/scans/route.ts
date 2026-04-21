import { NextResponse, type NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { analyzeImage } from '@/lib/services/analyzeImageService';
import { saveScan } from '@/lib/services/scanRepository';
import { listHistory } from '@/lib/services/historyService';
import { uploadScanImage, createSignedReadUrl } from '@/lib/services/imageStorageService';
import { incrementScanUsage } from '@/lib/services/usageCounterService';
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

  const scanId = randomUUID();
  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await uploadScanImage({
    userId: user.id,
    scanId,
    buffer,
    mime: file.type,
  });

  const signedUrl = await createSignedReadUrl(uploaded.path, 60 * 60 * 24);

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
}
