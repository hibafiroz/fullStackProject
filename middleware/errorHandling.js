const { AppError } = require("../utils/error")

const errorHandlingMiddleware = (error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.status).render('error', {
            title: 'Error',
            status: error.status,
            message: error.message
        })
    }

    return res.status(500).render('error', {
        title: 'Error',
        status: 500,
        message: 'Server Error'
    })
}

module.exports = { errorHandlingMiddleware }