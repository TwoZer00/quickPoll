/* eslint-disable space-before-function-paren */
import { collection, doc, getFirestore, runTransaction, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore'
import { app } from './init'
import { getAuth, signInAnonymously } from 'firebase/auth'
import CError from '../error/Error'

const db = getFirestore(app)
async function createPoll({ title, options }) {
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
    if (lastVote) {
      const lastVoteRef = doc(collection(pollRef, 'options', lastVote.id, 'votes'), getAuth().currentUser.uid)
      await deleteDoc(lastVoteRef)
    }
    await setDoc(voterRef, { id: getAuth().currentUser.uid, votedAt: new Date() })
  } catch (error) {
    if (error.code === 'permission-denied') throw CError.fromCode(16)
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
  return getDocs(collection(getFirestore(), 'polls', id, 'options'))
    .then(options => {
      if (options.empty) throw CError.fromCode(15)
      return options.docs.map(option => ({ id: option.id, ...option.data() }))
    })
    .then(async options => {
      return await Promise.all(options.map(async option => {
        const voted = await isVoted({ pollId: id, voteId: option.id })
        return { ...option, voted }
      }))
    })
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
function getSuscribeOption(poll, option, votes, setVotes, totalOpt) {
  const q = query(collection(getFirestore(), 'polls', poll.id, 'options', option.id, 'votes'))
  return onSnapshot(q, (querySnapshot) => {
    setVotes(querySnapshot.docs.length)
    totalOpt((prev) => {
      const temp = { ...prev }
      temp[option.id] = querySnapshot.docs.length
      return temp
    })
  })
}

const requuestStateEnum = {
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
  getSuscribeOption,
  requuestStateEnum
}
