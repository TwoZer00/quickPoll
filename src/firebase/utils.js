/* eslint-disable space-before-function-paren */
import { collection, doc, getFirestore, runTransaction, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { app } from './init'
import { getAuth } from 'firebase/auth'

const db = getFirestore(app)
async function createPoll({ title, options }) {
  const poll = doc(collection(db, 'polls'))
  const optionsTemp = options.map((option) => ({ title: option }))
  await runTransaction(db, async (transaction) => {
    transaction.set(poll, { title, author: doc(getFirestore(), 'user', getAuth().currentUser.uid) })
    for (const option in optionsTemp) {
      const optionRef = doc(collection(poll, 'options'))
      transaction.set(optionRef, optionsTemp[option])
    }
  })
  const pollId = poll.id
  const lastPolls = JSON.parse(sessionStorage.getItem('lastPolls') || '[]')
  lastPolls.push({ id: pollId, uid: getAuth().currentUser.uid, title, createdAt: new Date() })
  sessionStorage.setItem('lastPolls', JSON.stringify(lastPolls))
  return poll.id
}
async function getPoll(id) {
  const poll = await getDoc(doc(db, 'polls', id))
  return poll.data()
}
async function setVote({ lastVote, voteId, pollId }) {
  const pollRef = doc(db, 'polls', pollId)
  const optionRef = doc(pollRef, 'options', voteId)
  const votesRef = collection(optionRef, 'votes')
  const voterRef = doc(votesRef, getAuth().currentUser.uid)

  if (lastVote) {
    const lastVoteRef = doc(collection(pollRef, 'options', lastVote.id, 'votes'), getAuth().currentUser.uid)
    await deleteDoc(lastVoteRef).catch((err) => console.log(err))
  }
  await setDoc(voterRef, { id: getAuth().currentUser.uid })
}

async function isVoted({ pollId, voteId }) {
  const pollRef = doc(db, 'polls', pollId)
  const optionRef = doc(pollRef, 'options', voteId)
  const votesRef = collection(optionRef, 'votes')
  const voterRef = doc(votesRef, getAuth().currentUser.uid)
  return await getDoc(voterRef).then((doc) => doc.exists())
}

async function getOptions(id) {
  return getDocs(collection(getFirestore(), 'polls', id, 'options'))
    .then(options => options.docs.map(option => ({ id: option.id, ...option.data() })))
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

export {
  createPoll,
  getPoll,
  setVote,
  isVoted,
  getOptions,
  getResults
}
