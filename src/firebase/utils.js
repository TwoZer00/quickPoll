import { getFirestore } from 'firebase/firestore'
import { app } from './init'

const db = getFirestore(app)
async function createPoll(data) {
  return db.collection('polls').add(data)
}

export {
  createPoll
}
