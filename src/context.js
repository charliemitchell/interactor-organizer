module.exports = class Context {
  constructor (context) {
    Object.assign(this, context)
  }

  fail (errors) {
    this.failed = true;
    this.success = false;
    this.errors = errors;
    throw(errors)
  }

  failed = false
  success = false
}
