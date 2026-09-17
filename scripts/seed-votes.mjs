import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://api.twz00.dev'
const SUPABASE_KEY = 'sb_publishable_sKg46Yplb73OVSg3qSgy9p_U3xc70b9'
const POLL_ID = '068fa998-16bf-427e-8b7c-96f1ad695843'
const VOTE_COUNTS = [30, 28, 22, 20]

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const { data: opts } = await supabase.from('options').select('id, title').eq('poll_id', POLL_ID)

for (let i = 0; i < opts.length; i++) {
  for (let j = 0; j < VOTE_COUNTS[i]; j++) {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY)
    await client.auth.signInAnonymously()
    const { data: { user } } = await client.auth.getUser()
    await client.from('votes').insert({ poll_id: POLL_ID, option_id: opts[i].id, user_id: user.id })
  }
  console.log(`Voted ${VOTE_COUNTS[i]}x for ${opts[i].title}`)
}
