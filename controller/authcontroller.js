const jwt = require('jsonwebtoken');
const { GetUserByRefreshToken, generateAccessToken, GetUserByID, Logout, CheckUserByDecodedToken, generateRefreshToken, RefreshTokenComparer, UserCreate, updateRefreshToken, IsUserExistByEmail, GetUserByEmail, generateResetToken, findRoleID } = require("../app/user.app");
const bcrypt = require('bcryptjs');
const contentValidation = require("../utils/contentValidation");
const { con } = require('../model/DB');
const Mailsender = require('../utils/mail/Mailer');

class AuthController {
    async signUp(req, res, next) {
        const { Email, Password, Username } = req.body
        try {
            const validateresult = contentValidation.TotalValidator({ Email, Password, Username })
            if (validateresult) {
                res.status(422).json({
                    success: false,
                    data: null,
                    error: {
                        message: validateresult
                    }
                })
            }
            const userExists = await IsUserExistByEmail(Email);
            if (userExists) {
                res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        message: "user exist already"
                    }
                })
            } else {
                const role = await findRoleID(1)
                const creation = await UserCreate(Email, Username, Password , role.ID);
                res.status(201).json({
                    success: true,
                    data: {
                        message: creation
                    },
                    error: null
                })
            }
        } catch (err) {
            next(err)
        }

    }
    async Signin(req, res, next) {
        const { Password, Email } = req.body
        try {
            const validation = contentValidation.TotalValidator({ Email, Password })
            if (validation) {
                res.status(422).json({
                    success: false,
                    data: null,
                    error: {
                        message: validation
                    }
                })
            }
            const user = await GetUserByEmail(Email);

            if (!user) {
                res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        message: "user not found"
                    }
                })
            }

            const isMatch = await bcrypt.compare(Password, user.Password);

            if (isMatch) {
                const { Email } = user;
                const accessToken = generateAccessToken({ Role : user.RoleID , Email, Id: user.ID });
                const refreshToken = generateRefreshToken({ Role : user.RoleID ,Email, Id: user.ID });
                await updateRefreshToken(Email, refreshToken);

                res.cookie('jwt', refreshToken, {
                    httpOnly: true,
                    secure: false,
                });

                return res.status(421).json({
                    success: false,
                    data: {
                        message: " access token generated successfully",
                        token: accessToken
                    },
                    error: null
                })
            } else {
                res.status(400).json({
                    success: false,
                    data: null,
                    error: {
                        message: "user not found"
                    }
                })
            }
        } catch (error) {
            next(error)
        }
    }
    async authChecker(req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                data: null,
                error: {
                    message: 'auth header doesnt find'
                }
            })
        }

        const tokenParts = authHeader.split(' ');

        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    message: 'Invalid token format'
                }
            })
        }

        const token = tokenParts[1];

        jwt.verify(token, process.env.JWT_ACCESS_KEY, async (err, decoded) => {
            if (err) {
                return next(err)
            }

            const { Email, Id  , Role} = decoded
            const user = await CheckUserByDecodedToken(Email, Id , Role);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        message: 'user doesnt find'
                    }
                })
            }
            const cookie = req.cookies
            if (!cookie?.jwt) {
                const Logoutsituation = await Logout(res, user.Id)
                return res.status(401).json({
                    success: false,
                    data: null,
                    error: {
                        message: Logoutsituation.message,
                        token: Logoutsituation.EmptyToken
                    }
                })
            }
            const CompareRefreshToken = await RefreshTokenComparer(cookie.jwt)
            if (!CompareRefreshToken) {
                res.status(409).json({
                    success: false,
                    data: null,
                    error: {
                        message: 'Refresh Tokens are not equal'
                    }
                })
            }
            req.user = user;
            next();
        });
    }
    async RefreshTokenChecker(req, res, next) {
        try {
            const cookies = req.cookies
            if (!cookies?.jwt) {
                return res.status(403).json({
                    message: "forbidden"
                })
            }
            const token = cookies.jwt

            const user = await GetUserByRefreshToken(token)
            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        message: 'user not found'
                    }
                })
            }
            jwt.verify(token, process.env.JWT_REFRESH_KEY, async (err, decoded) => {
                if (err) {
                    next(err)
                }
                const { Email, Id , Role } = decoded
                const newuser = await CheckUserByDecodedToken(Email, Id , Role);
                if (!newuser) {
                    return res.status(421).json({
                        message: "User doesnt match",
                    });
                }
                req.user = user
                var newtoken = generateAccessToken({ Role : req.user.RoleID , Id: req.user.ID, Email: req.user.Email })
                return res.status(421).json({
                    success: false,
                    data: {
                        message: "New access token generated successfully",
                        newtoken
                    },
                    error: null
                })
            })

        } catch (error) {
            next(error)
        }
    }
    async Logout(req, res, next) {
        try {
            const Id = req.user.Id
            const user = await GetUserByID(Id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        message: 'user not found'
                    }
                })
            }
            const LoggedOutSituation = await Logout(res, Id)
            return res.status(200).json({
                success: false,
                data: null,
                error: {
                    message: LoggedOutSituation.message,
                    token: LoggedOutSituation.token
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async linksender(req, res, next) {
        try {
            const email = req.body.email
            if (!email) {
                return res.status(422).json({
                    success : false,
                    data : null,
                    error : {
                        message : "email doesnt exist"
                    }
                })
            }
            const user = await GetUserByEmail(email)
            if (!user) {
                return res.status(404).json({
                    success : false,
                    data : null,
                    error : {
                        message : "User doesnt exist"
                    }
                })
            }
            const resetToken = generateResetToken({ Role : user.RoleID , email, Id: user.Id });
            const resetlink = `http://127.0.0.1:1457/${resetToken}`
            ///send mail
            await Mailsender.sendMail({
                from : "mojtabaramezanitestmail@academytestyek.com",
                to: email,
                subject : "Change Password",
                html : `<form method = 'POST' action = ${resetToken}><input name = 'password' placeholder = 'password' type='password' /></form>`
         })
            //end of send mail

            res.status(200).json({
                error: null,
                success: true,
                data: {
                    message: "link sended",
                    resetlink
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async passwordReset(req, res, next) {
        try {
            let { password, confirmpassword } = req.body;

            if (password !== confirmpassword) {
                return res.status(422).json({
                    success: false,
                    error: {
                        message: "Confirm password and password are not equal"
                    },
                    data: null
                });
            }

            const token = req.params.token;

            jwt.verify(token, process.env.JWT_RESET_TOKEN, async (err, decoded) => {
                if (err) {
                    return next(err);
                }

                const id = decoded.Id;
                const user = await GetUserByID(id);

                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: {
                            message: "User not found"
                        },
                        data: null
                    });
                }

                const sql = "UPDATE user SET password = ? WHERE Id = ?";
                password = await bcrypt.hash(password, 10);

                con.query(sql, [password, id], async (err, result) => {
                    if (err) {
                        return next(err);
                    }

                    res.clearCookie('jwt', { httpOnly: true, secure: false });

                    req.user = user;

                    const accessToken = generateAccessToken({   Role : user.RoleID , Email: user.Email, Id: user.Id });
                    const refreshToken = generateRefreshToken({ Role : user.RoleID , Email: user.Email, Id: user.Id });

                    await updateRefreshToken(user.Email, refreshToken);

                    res.cookie('jwt', refreshToken, { httpOnly: true, secure: false });
                    console.log(req.user.Password);
                    console.log(password);
                    return res.status(200).json({
                        success: true,
                        error: null,
                        data: {
                            token: accessToken,
                            message: "Password changed successfully"
                        }
                    });
                });
            });
        } catch (error) {
            return next(error);
        }
    }

}

module.exports = new AuthController()