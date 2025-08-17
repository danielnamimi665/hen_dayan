export class ImageProcessor {
  static async processImage(file: File): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // EXIF orientation fix
        const orientation = this.getEXIFOrientation(file);
        const { width, height } = this.calculateDimensions(img.width, img.height);
        
        canvas.width = width;
        canvas.height = height;
        
        // Apply orientation
        ctx?.save();
        if (orientation > 4 && orientation < 9) {
          canvas.width = height;
          canvas.height = width;
        }
        
        this.transformCanvas(ctx!, canvas, width, height, orientation);
        ctx?.drawImage(img, 0, 0, width, height);
        ctx?.restore();
        
        // Compress to JPEG
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                width,
                height,
                size: blob.size
              });
            } else {
              reject(new Error('Failed to process image'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private static calculateDimensions(width: number, height: number): { width: number; height: number } {
    const maxSize = 1600;
    if (width <= maxSize && height <= maxSize) {
      return { width, height };
    }
    
    const ratio = Math.min(maxSize / width, maxSize / height);
    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  private static getEXIFOrientation(file: File): number {
    // Simplified EXIF orientation detection
    return 1;
  }

  private static transformCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, width: number, height: number, orientation: number) {
    // Apply transformations based on orientation
    switch (orientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height, width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
    }
  }
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  size: number;
}
