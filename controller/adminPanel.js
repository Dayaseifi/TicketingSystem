const { getAllNotAnsweredTickets, Alltickets } = require("../app/ticket/ticket.app");
const {GetUserByEmail, findRoleID, ClearRefreshAtDB, ChangeUserRole} = require('../app/user.app');
class admninPanel {
    async ticketAll(req, res, next) {
        try {
            //host is 1
            const tickets = await Alltickets(1)
            return res.status(200).json({
                success: true,
                error: null,
                data: {
                    tickets
                }
            })
        } catch (error) {
            return next(error)
        }
    }

    async NotAnsweredTickets(req, res, next) {
        try {
            //host ID is 1
            const tickets = await getAllNotAnsweredTickets(1)
            return res.status(200).json({
                success: true,
                error: null,
                data: {
                    tickets
                }
            })
        } catch (error) {
            return next(error)
        }
    }
    async ImproveTo(req, res, next){
        try {
            const {email , RoleID} = req.body
            const user = await GetUserByEmail(email)
            if (!user) {
                return res.status(404).json({
                    error : {
                        message : "user doesnt exist by email on system"
                    },
                    data : null,
                    success : false
                })
            }
            const role = await findRoleID(RoleID)
            if (!role) {
                return res.status(404).json({
                    error : {
                        message : "role doesnt exist  on system"
                    },
                    data : null,
                    success : false
                })
            }
            await ChangeUserRole(user.ID , role.ID)
            await ClearRefreshAtDB(user.ID)
            return res.status(200).json({
                data : {
                    message : "user change role succesfully , attention : User should log in again"
                },
                error : null,
                success : true
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new admninPanel