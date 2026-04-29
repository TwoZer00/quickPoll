export const POLL_DURATION_MINUTES = 30
export const POLL_DURATION_SECONDS = POLL_DURATION_MINUTES * 60

const ERRORS = {
  15: 'poll not found',
  16: 'poll closed',
  17: 'failed to load poll',
  'permission-denied': 'you don\'t have permission to do that',
  'unavailable': 'service is temporarily unavailable, please try again',
  'not-found': 'the requested resource was not found',
  'unauthenticated': 'authentication failed, please refresh the page'
}

export default ERRORS
