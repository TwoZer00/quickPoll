import dayjs from 'dayjs'
import { POLL_DURATION_MINUTES } from '../const/Const'
/**
 *
 * @param {string} date miliseconds
 * @return {boolean} true if the poll is closed, false otherwise
 * @description Checks if the poll is closed. A poll is considered closed if it was created more than POLL_DURATION_MINUTES ago.
 */
function isPollClosed (date) {
  const result = dayjs().diff(dayjs(date), 'm') >= POLL_DURATION_MINUTES
  // console.log(`isPollClosed: ${result} for date ${date} (${dayjs(date).format('YYYY-MM-DD HH:mm:ss')})`)
  return result
}

export {
  isPollClosed
}
