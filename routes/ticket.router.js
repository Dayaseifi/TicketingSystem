const { Router } = require("express");
const ticketController = require("../controller/ticketController");
const { authChecker } = require("../controller/authcontroller");
const privacy = require("../app/privacy");
const upload = require("../utils/multer/multerConfig");

const router = Router()

router.get("/:id", authChecker, ticketController.findTicketByID)

router.post("/create/:category", authChecker, async function (req, res, next) {
    try {
        const hasPermission = await privacy.RoleChecker(req, 1)
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: {
                    messaging: "does not have permission"
                },
                data: null
            });
        }
        next();
    } catch (error) {
        return next(error);
    }
}, ticketController.create)

router.post("/message/Host/:id", authChecker, async function (req, res, next) {
    try {
        const hasPermission = await privacy.RoleChecker(req, 1, 2)
        console.log(hasPermission);
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: {
                    messaging: "does not have permission"
                },
                data: null
            });
        }
        next();
    } catch (error) {
        return next(error);
    }
}, ticketController.messaging);


router.post("/message/Domain/:id", authChecker, async function (req, res, next) {
    try {
        const hasPermission = await privacy.RoleChecker(req, 1, 3)
        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                error: {
                    messaging: "does not have permission"
                },
                data: null
            });
        }
        next();
    } catch (error) {
        return next(error);
    }
}, ticketController.messaging)

router.post("/image/upload" , authChecker , upload.array("files" , 5) ,ticketController.fileUpload )


module.exports = router