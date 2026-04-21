import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

const BUCKET = 'scan-images';

export interface UploadedImage {
  path: string;
  bytes: number;
  mime: string;
}

export async function uploadScanImage(params: {
  userId: string;
  scanId: string;
  buffer: Buffer;
  mime: string;
}): Promise<UploadedImage> {
  const supabase = createServiceRoleClient();
  const path = `${params.userId}/${params.scanId}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, params.buffer, {
      contentType: params.mime,
      upsert: false,
    });

  if (error) {
    throw new Error(`storage upload failed: ${error.message}`);
  }

  return { path, bytes: params.buffer.byteLength, mime: params.mime };
}

export async function createSignedReadUrl(path: string, expiresInSeconds: number): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) {
    throw new Error(`signed url failed: ${error?.message ?? 'unknown'}`);
  }
  return data.signedUrl;
}
