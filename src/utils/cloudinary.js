const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadImage (file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary config missing')
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Invalid file type')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  })
  if (!res.ok) throw new Error('Image upload failed')
  const { public_id } = await res.json()
  return {
    url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto:low,f_auto,w_200/${public_id}`,
    public_id
  }
}
