class FailedContextError extends Error {
  constructor(message) {
    super(message);
    this.name = "FailedContextError";
  }
}

module.exports = class Context {
  constructor (context) {
    Object.assign(this, context)
  }

  fail (error) {
    this.failure = true;
    this.success = false;
    this.error = error;
    throw new FailedContextError(error)
  }

  failure = false
  success = false
}
