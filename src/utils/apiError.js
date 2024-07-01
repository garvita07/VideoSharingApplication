class apiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong.",
    stack,
    error = []
  ) {
    super(message); //this calls the parent constructor, the one from the 'Error' Class.
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  } // everything till here will call the parent constructor and will be initialized by it.
}

export default apiError;
