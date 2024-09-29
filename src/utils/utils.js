import dayjs from 'dayjs'
/**
 *
 * @param {string} date miliseconds
 * @returns true if poll date is older than 30 minutes, false if poll is still open
 */
function isPollClosed (date) {
  return dayjs().diff(dayjs(date), 'm') >= 30
}

export {
  isPollClosed
}
