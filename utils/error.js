class AppError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404)
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400)
  }
}

class UnAuthorized extends AppError {
  constructor(message) {
    super(message, 401)
  }
}

class Duplicates extends AppError {
  constructor(message) {
    super(message,409)
  }
}

module.exports = { AppError, NotFoundError, UnAuthorized, BadRequestError, Duplicates }
