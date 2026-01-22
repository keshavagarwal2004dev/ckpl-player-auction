import { supabase } from './supabase'
import { resizeImage } from './imageUtils'
import { generateId } from './utils'

export async function uploadPlayerPhoto(file: File): Promise<string> {
  // Resize and compress image before upload
  const compressedFile = await resizeImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.85,
  })

  const ext = 'jpg'
  const path = `player-${generateId()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('player-photos')
    .upload(path, compressedFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('player-photos').getPublicUrl(path)
  return data.publicUrl
}
