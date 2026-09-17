import dayjs from 'dayjs'
import { POLL_DURATION_MINUTES } from '../const/Const'
/**
 *
 * @param {string} date miliseconds
 * @return {boolean} true if the poll is closed, false otherwise
 * @description Checks if the poll is closed. A poll is considered closed if it was created more than POLL_DURATION_MINUTES ago.
 */
function isPollClosed (date) {
  const ms = date?.seconds ? date.seconds * 1000 : date
  const result = dayjs().diff(dayjs(ms), 'm') >= POLL_DURATION_MINUTES
  return result
}

export {
  isPollClosed
}
