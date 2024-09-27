class CError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
  }

  static fromCode(code, message) {
    return new CError(message, code)
  }

  static fromError(error) {
    return new CError(error.message, error.code)
  }

  static fromErrorAndCode(error, code) {
    return new CError(error.message, code)
  }
}
export default CError
