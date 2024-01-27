const { Router } = require("express");
const authcontroller = require("../controller/authcontroller");

const router = Router()

router.post("/signup", authcontroller.signUp)

router.post("/signin", authcontroller.Signin)

router.get("/test", authcontroller.authChecker, (req, res) => {
    res.json({ message: "all ok" })
})

router.post("/resetpassword", authcontroller.authChecker, authcontroller.linksender)

router.post("/reset/:token", authcontroller.authChecker, authcontroller.passwordReset)

router.post('/refresh', authcontroller.authChecker, authcontroller.RefreshTokenChecker)



module.exports = router