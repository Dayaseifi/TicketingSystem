class errorHandler {
    error404(req, res) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                message : "route not found"
            }
        })
    }
    unexceptionError(err, req, res, next) {
        const statusCode = err.status || 500
        const message = err.message || 'Internal Server Error'
        return res.status(statusCode).json({
            success: false,
            data: null,
            error: {
                message
            }
        })
    }
}

module.exports = new errorHandler()