/* eslint-disable space-before-function-paren */
import { collection, doc, getFirestore, runTransaction, getDoc, getDocs, onSnapshot, query } from 'firebase/firestore'
import { app } from './init'
import { getAuth, signInAnonymously } from 'firebase/auth'
import CError from '../error/Error'
import { getAnalytics, logEvent } from 'firebase/analytics'

const db = getFirestore(app)
async function createPoll({ title, options }) {
  title = title.trim()
  options = [...new Set(options.map(o => o.trim()).filter(o => o.length > 0))]
  if (title.length < 3 || title.length > 200 || options.length < 2) throw CError.fromCode(17, 'Invalid poll data')
  if (!getAuth().currentUser) await signInAnonymously(getAuth())
  const poll = doc(collection(db, 'polls'))
  const optionsTemp = options.map((option) => ({ title: option }))
  const pollData = { title, createdAt: new Date(), author: doc(getFirestore(), 'user', getAuth().currentUser?.uid) }
  await runTransaction(db, async (transaction) => {
    transaction.set(poll, pollData)
    for (const option in optionsTemp) {
      const optionRef = doc(collection(poll, 'options'))
      transaction.set(optionRef, optionsTemp[option])
    }
  })
  const analytics = !import.meta.env.VITE_ENV ? getAnalytics() : null
  if (analytics) logEvent(analytics, 'poll_created', { pollId: poll.id, author: getAuth().currentUser?.uid })
  const lastPolls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')
  lastPolls.push({ ...pollData, id: poll.id, author: getAuth().currentUser?.uid })
  sessionStorage.setItem('lastPolls', JSON.stringify(lastPolls))
  return poll.id
}
async function getPoll(id) {
  const poll = await getDoc(doc(db, 'polls', id))
  if (!poll.exists()) throw CError.fromCode(15)
  return poll.data()
}
async function setVote({ lastVote, voteId, pollId }) {
  if (!getAuth().currentUser) await signInAnonymously(getAuth())
  const pollRef = doc(db, 'polls', pollId)
  const optionRef = doc(pollRef, 'options', voteId)
  const votesRef = collection(optionRef, 'votes')
  const voterRef = doc(votesRef, getAuth().currentUser?.uid)
  try {
    await runTransaction(db, async (transaction) => {
      if (lastVote) {
        const lastVoteRef = doc(collection(pollRef, 'options', lastVote.id, 'votes'), getAuth().currentUser.uid)
        transaction.delete(lastVoteRef)
      }
      transaction.set(voterRef, { id: getAuth().currentUser.uid, votedAt: new Date() })
    })
    const analytics = !import.meta.env.VITE_ENV ? getAnalytics() : null
    if (analytics) logEvent(analytics, 'poll_voted', { pollId, voteId, voterId: getAuth().currentUser?.uid })
  } catch (error) {
    if (error.code === 'permission-denied') throw CError.fromCode(16)
    throw CError.fromError(error)
  }
}

async function isVoted({ pollId, voteId }) {
  if (!getAuth().currentUser) return false
  const pollRef = doc(db, 'polls', pollId)
  const optionRef = doc(pollRef, 'options', voteId)
  const votesRef = collection(optionRef, 'votes')
  const voterRef = doc(votesRef, getAuth().currentUser?.uid)
  return await getDoc(voterRef).then((doc) => doc.exists())
}

async function getOptions(id) {
  const options = await getDocs(collection(getFirestore(), 'polls', id, 'options'))
  if (options.empty) throw CError.fromCode(15)
  const mapped = options.docs.map(option => ({ id: option.id, ...option.data() }))
  if (!getAuth().currentUser) return mapped.map(o => ({ ...o, voted: false }))
  const voteChecks = await Promise.all(
    mapped.map(o => getDoc(doc(getFirestore(), 'polls', id, 'options', o.id, 'votes', getAuth().currentUser.uid)))
  )
  return mapped.map((o, i) => ({ ...o, voted: voteChecks[i].exists() }))
}

async function getResults(id) {
  return getDocs(collection(getFirestore(), 'polls', id, 'options'))
    .then(options => options.docs.map(option => ({ id: option.id, ...option.data() })))
    .then(async options => {
      return await Promise.all(options.map(async option => {
        const votes = await getDocs(collection(getFirestore(), 'polls', id, 'options', option.id, 'votes'))
        return { ...option, votes: votes.docs.length }
      }))
    })
}
function getSubscribeOption(poll, option, votes, setVotes, totalOpt) {
  const q = query(collection(getFirestore(), 'polls', poll.id, 'options', option.id, 'votes'))
  return onSnapshot(q, (querySnapshot) => {
    setVotes(querySnapshot.docs.length)
    totalOpt((prev) => {
      const temp = { ...prev }
      temp[option.id] = querySnapshot.docs.length
      return temp
    })
  }, (error) => {
    console.error('Snapshot listener error:', error)
    setVotes(0)
  })
}

const requestStateEnum = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  error: 'error'
}

export {
  createPoll,
  getPoll,
  setVote,
  isVoted,
  getOptions,
  getResults,
  getSubscribeOption,
  getSubscribeOption as getSuscribeOption,
  requestStateEnum,
  requestStateEnum as requuestStateEnum
}
