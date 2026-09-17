import { supabase } from './init'
import CError from '../error/Error'

async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) await supabase.auth.signInAnonymously()
  return (await supabase.auth.getUser()).data.user
}

async function createPoll({ title, options }) {
  title = title.trim()
  options = options
    .filter(o => o.title.trim().length > 0)
    .map(o => ({ ...o, title: o.title.trim() }))
  const unique = [...new Map(options.map(o => [o.title.toLowerCase(), o])).values()]
  if (title.length < 3 || title.length > 200 || unique.length < 2) throw CError.fromCode(17, 'Invalid poll data')

  const user = await ensureAuth()

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ title, author_id: user.id })
    .select('id')
    .single()
  if (pollError) throw CError.fromError(pollError)

  const { error: optError } = await supabase
    .from('options')
    .insert(unique.map(o => ({ poll_id: poll.id, title: o.title, image: o.image || null, color: o.color || null })))
  if (optError) throw CError.fromError(optError)

  const lastPolls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')
  lastPolls.push({ id: poll.id, title, createdAt: { seconds: Date.now() / 1000 }, author: user.id })
  sessionStorage.setItem('lastPolls', JSON.stringify(lastPolls))
  if (import.meta.env.PROD) window.umami?.track('poll_created', { pollId: poll.id })

  return poll.id
}

async function getPoll(id) {
  const { data, error } = await supabase
    .from('polls')
    .select('id, title, created_at, author_id')
    .eq('id', id)
    .single()
  if (error || !data) throw CError.fromCode(15)
  const poll = { ...data, createdAt: { seconds: new Date(data.created_at).getTime() / 1000 } }

  const lastPolls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')
  const idx = lastPolls.findIndex(p => p.id === id)
  if (idx !== -1) {
    lastPolls[idx] = { ...lastPolls[idx], createdAt: poll.createdAt }
    sessionStorage.setItem('lastPolls', JSON.stringify(lastPolls))
  }

  return poll
}

async function getOptions(id) {
  const user = await ensureAuth()

  const { data: opts, error } = await supabase
    .from('options')
    .select('id, title, image, color')
    .eq('poll_id', id)
  if (error || !opts?.length) throw CError.fromCode(15)

  const { data: userVotes } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', id)
    .eq('user_id', user.id)

  const votedId = userVotes?.[0]?.option_id
  const result = opts.map(o => ({ ...o, voted: o.id === votedId }))

  if (votedId) {
    const lastPolls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')
    const idx = lastPolls.findIndex(p => p.id === id)
    if (idx !== -1 && !lastPolls[idx].voted) {
      lastPolls[idx] = { ...lastPolls[idx], voted: true }
      sessionStorage.setItem('lastPolls', JSON.stringify(lastPolls))
    }
  }

  return result
}

async function setVote({ voteId, pollId }) {
  const user = await ensureAuth()

  const { error } = await supabase.from('votes').upsert(
    { poll_id: pollId, option_id: voteId, user_id: user.id },
    { onConflict: 'poll_id,user_id' }
  )
  if (error) {
    if (error.code === '42501') throw CError.fromCode(16)
    throw CError.fromError(error)
  }

  const lastPolls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')
  const idx = lastPolls.findIndex(p => p.id === pollId)
  if (idx !== -1) {
    lastPolls[idx] = { ...lastPolls[idx], voted: true }
    sessionStorage.setItem('lastPolls', JSON.stringify(lastPolls))
  }

  if (import.meta.env.PROD) window.umami?.track('poll_voted', { pollId, optionId: voteId })
}

async function getResults(id) {
  const { data: opts, error } = await supabase
    .from('options')
    .select('id, title, image, color')
    .eq('poll_id', id)
  if (error) throw CError.fromError(error)

  const { data: votes } = await supabase
    .from('votes')
    .select('option_id')
    .eq('poll_id', id)

  return opts.map(o => ({
    ...o,
    votes: votes?.filter(v => v.option_id === o.id).length ?? 0
  }))
}

const requestStateEnum = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  error: 'error'
}

export { createPoll, getPoll, setVote, getOptions, getResults, requestStateEnum }
