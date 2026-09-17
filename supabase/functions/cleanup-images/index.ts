import { createClient } from 'jsr:@supabase/supabase-js@2'

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')!
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')!
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')!

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: options, error } = await supabase
    .from('options')
    .select('id, image_public_id')
    .not('image_public_id', 'is', null)
    .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  if (!options?.length) return new Response(JSON.stringify({ deleted: 0 }), { status: 200 })

  const deleted: string[] = []
  for (const opt of options) {
    if (!opt.image_public_id.startsWith('quickpoll/')) continue
    const timestamp = Math.floor(Date.now() / 1000)
    const str = `public_id=${opt.image_public_id}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
    const hashBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str))
    const signature = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const form = new FormData()
    form.append('public_id', opt.image_public_id)
    form.append('timestamp', String(timestamp))
    form.append('api_key', CLOUDINARY_API_KEY)
    form.append('signature', signature)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: form
    })

    if (res.ok) {
      await supabase.from('options').update({ image_public_id: null }).eq('id', opt.id)
      deleted.push(opt.image_public_id)
    }
  }

  return new Response(JSON.stringify({ deleted: deleted.length, ids: deleted }), { status: 200 })
})
