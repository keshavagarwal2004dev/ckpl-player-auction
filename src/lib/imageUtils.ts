export interface ImageResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeBytes?: number
}

/**
 * Resize and compress image file to stay under size limit
 * @param file - Image file to resize
 * @param options - Resize options (maxWidth, maxHeight, quality, maxSizeBytes)
 * @returns Promise<File> - Resized and compressed image file
 */
export async function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<File> {
  const { 
    maxWidth = 400, 
    maxHeight = 400, 
    quality = 0.85,
    maxSizeBytes = 2 * 1024 * 1024 // 2MB default
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = async () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Compress with quality adjustment to stay under size limit
        let currentQuality = quality
        let blob: Blob | null = null
        let attempts = 0
        const maxAttempts = 10

        while (attempts < maxAttempts) {
          blob = await new Promise<Blob | null>((blobResolve) => {
            canvas.toBlob(
              (b) => blobResolve(b),
              'image/jpeg',
              currentQuality
            )
          })

          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          // If size is under limit or quality is already very low, use this version
          if (blob.size <= maxSizeBytes || currentQuality <= 0.1) {
            break
          }

          // Reduce quality for next attempt
          currentQuality = Math.max(0.1, currentQuality - 0.1)
          attempts++
        }

        if (!blob) {
          reject(new Error('Failed to compress image'))
          return
        }

        // Final check - if still over limit, reject
        if (blob.size > maxSizeBytes) {
          reject(new Error(`Image size (${(blob.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB). Please use a smaller image.`))
          return
        }

        const resizedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })

        resolve(resizedFile)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}
