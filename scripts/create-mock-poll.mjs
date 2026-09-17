import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://api.twz00.dev',
  'sb_publishable_sKg46Yplb73OVSg3qSgy9p_U3xc70b9'
)

const OPTIONS = [
  { title: 'JavaScript', image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { title: 'Python',     image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { title: 'Rust',       image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rust/rust-original.svg' },
  { title: 'Go',         image: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg' }
]

await supabase.auth.signInAnonymously()
const { data: { user } } = await supabase.auth.getUser()

const { data: poll, error: pollError } = await supabase
  .from('polls')
  .insert({ title: 'What is your favorite programming language?', author_id: user.id })
  .select('id')
  .single()

if (pollError) { console.error(pollError); process.exit(1) }

const { error: optError } = await supabase
  .from('options')
  .insert(OPTIONS.map(o => ({ poll_id: poll.id, title: o.title, image: o.image })))

if (optError) { console.error(optError); process.exit(1) }

console.log(`Poll created: https://quickpoll.twozer00.dev/en/poll/${poll.id}`)
