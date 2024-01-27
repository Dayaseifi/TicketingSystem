const { con } = require("../model/DB");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


async function IsUserExistByEmail(Email) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM user WHERE Email = ?`
        con.query(sql, [Email], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length > 0);
            }
        });
    });
}



async function UserCreate(Email, UserName, Password , RoleID) {
    return new Promise(async (resolve, reject) => {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const sql = `INSERT INTO user (Email, Username, password , RoleID) VALUES (?, ? , ? , ?)`;
        const values = [Email, UserName, hashedPassword , RoleID];
        con.query(sql, values, (err) => {
            if (err) {
                return reject(err)
            }
            return resolve('User cerated Succesfully')
        });
    })

}



async function Loggin(res, Email, Password) {
    try {
        const user = await GetUserByEmail(Email);

        if (!user) {
            return errorHandler(res, StatusCodes.NOT_FOUND, 'User not found');
        }

        const isMatch = await bcrypt.compare(Password, user.Password);

        if (isMatch) {
            const { Email, Role_ID } = user;
            const accessToken = generateAccessToken({ Email, Role: Role_ID, Id: user.Id });
            const refreshToken = generateRefreshToken({ Email, Role: Role_ID, Id: user.Id });

            await updateRefreshToken(Email, refreshToken);

            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.COOKIE_PASSWORD === 'true',
            });

            return res.status(StatusCodes.OK).json({
                message: "Login successful",
                token: accessToken
            });
        } else {
            return errorHandler(res, StatusCodes.BAD_REQUEST, 'Password is not a match');
        }
    } catch (error) {
        return errorHandler(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
}

async function GetUserByEmail(Email) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM user WHERE Email = ?`;
        con.query(sql, [Email], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length > 0 ? result[0] : null);
            }
        });
    });
}

async function CheckUserByDecodedToken(Email, Id , RoleID) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM user WHERE Email = ? AND Id = ? AND RoleID = ?`;
        con.query(sql, [Email, Id , RoleID], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length > 0 ? result[0] : null);
            }
        });
    });
}

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE
    });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRE
    });
}

function generateResetToken(payload) {
    return jwt.sign(payload, process.env.JWT_RESET_TOKEN, {
        expiresIn: process.env.JWT_RESET_TOKEN_EXPIRE
    });
}


async function updateRefreshToken(Email, refreshToken) {
    const sql = `UPDATE user SET Refresh_token = ? WHERE Email = ?`;
    try {
        await query(sql, [refreshToken, Email]);
    } catch (error) {
        return errorHandler(res, StatusCodes.INTERNAL_SERVER_ERROR, error.message);
    }
}



function query(sql, values) {
    return new Promise((resolve, reject) => {
        con.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function RefreshTokenComparer(refreshToken) {
    return new Promise((resolve, reject) => {
        const sql = `select * from user where refresh_token = ?`
        const values = [refreshToken]
        con.query(sql, values, (err, result) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(result.length > 0 ? true : false)
            }
        })
    })
}

function GetUserByRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
        const sql = `select * from user where refresh_token = ?`
        const values = [refreshToken]
        con.query(sql, values, (err, result) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(result.length > 0 ? result[0] : null)
            }
        })
    })
}

function GetUserByID(ID) {
    return new Promise((resolve, reject) => {
        const sql = `select * from user where Id = ?`
        const values = [ID]
        con.query(sql, values, (err, result) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(result.length > 0 ? result[0] : null)
            }
        })
    })
}

function SetImageByUserID(image, ID) {
    return new Promise((resolve, reject) => {
        const sql = `
        UPDATE user SET Image = ? where Id = ? 
        `
        const values = [image, ID]
        con.query(sql, values, (err, result) => {
            if (err) {
                reject(err)
            }
            else {
                resolve("Image Uploaded")
            }
        })
    })
}

function ClearRefreshAtDB(Id) {
    return new Promise((resolve, reject) => {
        let sql = `update user set Refresh_token = ? where Id = ?`
        const values = [null, Id]
        con.query(sql, values, (err, result) => {
            if (err) {
                reject(err)
            }
            resolve('user loged out succesfully')
        })
    })
}

async function Logout(res, id) {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: false,
        })
        const EmptyToken = ''
        const message = await ClearRefreshAtDB(id)
        return { EmptyToken, message }
    } catch (error) {
        return errorHandler(res, 500, error.message)
    }
}

async function findRoleID(ID) {
    return new Promise((resolve, reject) => {
        const query = `select * from role where ID = ?`
        con.query(query , [ID] , (err , result) => {
            if (err) {
                return reject(err)
            }
            else{
               return resolve(result.length  == 0 ? null :  result[0])
            }
        })
    });
}

async function ChangeUserRole(userID , RoleID) {
    return new Promise((resolve, reject) => {
        let sql = `UPDATE user SET RoleID = ? WHERE ID = ?`
        con.query(sql , [RoleID , userID] , (err , result) => {
            if (err) {
                reject(err)
            }
            resolve(true)
        })
    });
}



module.exports = { ChangeUserRole , findRoleID ,generateResetToken, updateRefreshToken , IsUserExistByEmail, RefreshTokenComparer, generateRefreshToken, ClearRefreshAtDB, CheckUserByDecodedToken, Logout, SetImageByUserID, UserCreate, GetUserByID, Loggin, GetUserByEmail, GetUserByRefreshToken, generateAccessToken };
