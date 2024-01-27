const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..' , '..', 'public', 'upload'))
    },
    filename(req, file, cb) {
        const filename = `${Date.now()}-${Math.round(Math.random() * 9)}${path.extname(file.originalname)}`
        const allowedMimeType = ['.jpeg', '.jpg', '.mp4', '.png']
        if (!allowedMimeType.includes(path.extname(filename))) {
            const error = new Error('this type doesnt exist')
            error.status = 403;
            return cb(error, false)
        }
        return cb(null, filename)
    }
})

const upload = multer({ storage })

module.exports = upload