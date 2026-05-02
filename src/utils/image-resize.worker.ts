type Variant = { maxEdge: number; quality: number };

const THUMBNAIL: Variant = { maxEdge: 256, quality: 0.75 };
const DISPLAY: Variant = { maxEdge: 1600, quality: 0.85 };

async function encode(bitmap: ImageBitmap, v: Variant): Promise<Uint8Array> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, v.maxEdge / longest);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("OffscreenCanvas 2d context unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: v.quality });
  return new Uint8Array(await blob.arrayBuffer());
}

self.onmessage = async (e: MessageEvent<File>) => {
  const post = (self as unknown as Worker).postMessage.bind(self);
  try {
    const bitmap = await createImageBitmap(e.data);
    const [thumbnail, display] = await Promise.all([
      encode(bitmap, THUMBNAIL),
      encode(bitmap, DISPLAY),
    ]);
    bitmap.close();
    post({ ok: true, thumbnail, display }, [thumbnail.buffer, display.buffer]);
  } catch (err) {
    post({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};

export {};
