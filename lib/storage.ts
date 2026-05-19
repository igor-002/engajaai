import "server-only";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function extFromMime(mime: string): string {
  return (
    {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    }[mime] ?? "bin"
  );
}

function publicUrl(path: string): string {
  return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

function pathFromPublicUrl(url: string): string | null {
  const prefix = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
}

export async function uploadImage(
  file: File,
  folder: "products" | "categories",
): Promise<string> {
  if (!file || file.size === 0) throw new Error("Arquivo vazio");
  if (file.size > MAX_BYTES) throw new Error("Imagem maior que 5MB");
  if (!ALLOWED_MIMES.has(file.type)) {
    throw new Error(`Tipo de imagem não suportado: ${file.type}`);
  }

  const ext = extFromMime(file.type);
  const path = `${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw new Error(`Upload falhou: ${error.message}`);
  return publicUrl(path);
}

export async function deleteImageByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const path = pathFromPublicUrl(url);
  if (!path) return;
  await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
}
