const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COMPRESSED_SIZE = 80 * 1024; // 80KB
const TARGET_DIMENSION = 200;
const JPEG_QUALITY = 0.75;

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

export function validateFileSize(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.`;
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (!allowed.includes(file.type)) {
    return "Only JPG, PNG, or WebP images allowed.";
  }
  return null;
}

export function compressImage(file: File): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      if (width > TARGET_DIMENSION || height > TARGET_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * TARGET_DIMENSION);
          width = TARGET_DIMENSION;
        } else {
          width = Math.round((width / height) * TARGET_DIMENSION);
          height = TARGET_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx!.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }
          if (blob.size > MAX_COMPRESSED_SIZE) {
            // Try again with lower quality
            canvas.toBlob(
              (blob2) => {
                if (!blob2) {
                  reject(new Error("Compression failed"));
                  return;
                }
                resolve({ blob: blob2, width, height, size: blob2.size });
              },
              "image/webp",
              0.55
            );
            return;
          }
          resolve({ blob, width, height, size: blob.size });
        },
        "image/webp",
        JPEG_QUALITY
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export function compressionResultToDataUrl(result: CompressionResult): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(result.blob);
  });
}
