// custom hook, from code error gen a new error with custom message and code
export const useError = (code, message) => {
  const err = new Error()
  err.code = code
  err.message = message
  return err
}
