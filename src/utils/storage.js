export function getLastPolls () {
  try {
    return JSON.parse(sessionStorage.getItem('lastPolls')) || []
  } catch {
    sessionStorage.removeItem('lastPolls')
    return []
  }
}
