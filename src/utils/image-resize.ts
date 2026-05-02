import ImageResizeWorker from "./image-resize.worker?worker";

export type ImageDerivatives = {
  thumbnail: Uint8Array;
  display: Uint8Array;
};

export function deriveImages(file: File): Promise<ImageDerivatives> {
  return new Promise((resolve, reject) => {
    const worker = new ImageResizeWorker();
    worker.onmessage = (e: MessageEvent) => {
      worker.terminate();
      if (e.data.ok) resolve({ thumbnail: e.data.thumbnail, display: e.data.display });
      else reject(new Error(e.data.error ?? "image resize failed"));
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message ?? "image resize worker error"));
    };
    worker.postMessage(file);
  });
}
