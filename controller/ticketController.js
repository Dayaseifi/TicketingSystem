const image = require("../app/image/image")
const ticketApplication = require("../app/ticket/ticket.app")

class ticketController {
    async create(req, res, next) {
        try {
            const category = req.params.category
            const userID = req.user.ID
            const createTicketID = await ticketApplication.CreateTicket(userID, category)
            res.status(201).json({
                success: true,
                error: null,
                data: {
                    message: "ticket create succesfully",
                    id: createTicketID
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async findTicketByID(req, res, next) {
        const id = req.params.id
        console.log(id);
        try {
            const ticket = await ticketApplication.findTicketByID(id)
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        message: "there is not any ticket"
                    }
                })
            }
            const Userid = req.user.ID
            if (req.user.RoleID == 1 && ticket.Questioner_ID !== Userid) {
                return res.status(403).json({
                    success: false,
                    data: null,
                    error: {
                        message: "you do not have permission to see this ticket"
                    }
                })
            }
            const messages = await ticketApplication.findMessageOfTicket(ticket.ID)
            ticket.message = messages
            const photoes = await ticketApplication.findImageOfPhoto(ticket.message)
            
            ticket.message.forEach(message => {
                const messageId = message.ID;
                message.photoes = [];

                photoes.forEach(photoArray => {
                    photoArray.forEach(photo => {
                        if (photo.Message_ID === messageId) {
                            message.photoes.push(photo);
                        }
                    });
                });
            });

            return res.status(200).json({
                success: true,
                data: {
                    message: "Ticket finded",
                    ticket
                }
            })
        } catch (error) {
            next(error)
        }
    }
    async messaging(req, res, next) {
        try {
            let { title, Content, Images } = req.body
            
            if (!Images) {
                Images = []
            }
            const Ticketid = req.params.id
            const UserID = req.user.ID
            const ticket = await ticketApplication.findTicketByID(Ticketid)
            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    data: null,
                    error: {
                        message: "there is not any ticket"
                    }
                })
            }
            const messageCreate = await ticketApplication.createMessage(title, Content, Ticketid, UserID)
            if (req.user.RoleID == 2) {
                await ticketApplication.ChangeTicketStatus(Ticketid)
                await ticketApplication.ChangeLastAnswerer(UserID, Ticketid)
            }
            if (Images.length > 0) {
                const owning = await image.Owning(Images)
                console.log(owning);
                if (owning.length == 0) {
                    return res.status(200).json({
                        success  :false,
                        data : null,
                        error : {
                            message : "ID's are belong to another message"
                        }
                    })
                }
                await image.MessageBelonging(Images, messageCreate)
            }
            return res.status(201).json({
                error: null,
                success: true,
                data: {
                    message: "answer send succesfully",
                    id: messageCreate
                }
            })
        } catch (error) {
            console.log(error);
            return next(error)
        }
    }
    async fileUpload(req, res, next) {
        try {
            const filesName = req.files.map(e => {
                return e.filename
            })
            const srcName = req.files.map(e => {
                return `http://127.0.0.1:8000/public/upload/${e.filename}`
            })
            const imageID = await image.saveImagesInfoAtDB(filesName)
            res.status(201).json({
                success: true,
                error: null,
                data: {
                    srcName,
                    imageID
                }
            })
        } catch (error) {
            next(error)
        }


    }
}

module.exports = new ticketController