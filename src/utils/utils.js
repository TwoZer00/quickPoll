import dayjs from 'dayjs'
/**
 *
 * @param {string} date miliseconds
 * @return {boolean} true if the poll is closed, false otherwise
 * @description Checks if the poll is closed. A poll is considered closed if it was created more than 30 minutes ago.
 */
function isPollClosed (date) {
  const result = dayjs().diff(dayjs(date), 'm') >= 30
  // console.log(`isPollClosed: ${result} for date ${date} (${dayjs(date).format('YYYY-MM-DD HH:mm:ss')})`)
  return result
}

export {
  isPollClosed
}
