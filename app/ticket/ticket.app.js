const { con } = require("../../model/DB");

class ticketApplication {
    async CreateTicket(userID, category) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO ticket(Questioner_ID , Category_ID) VALUES(? , ?)`
            con.query(sql, [userID, category], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result.insertId)
            })
        });
    }
    async findTicketByID(ticketID) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT *
            FROM ticket
            WHERE ticket.ID = ?;
            `
            con.query(sql, [ticketID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result.length > 0 ? result[0] : null)
            })
        });
    }
    async createMessage(title, Content, Ticket_ID, Answerer_ID) {
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO message(Title,Content,Ticket_ID , Answerer_ID) VALUES(? , ? , ? , ?)`
            con.query(sql, [title, Content, Ticket_ID, Answerer_ID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result.insertId);
            })
        });
    }
    async ChangeTicketStatus(Ticket_ID) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE ticket set Status = ? WHERE ID = ?`
            con.query(sql, [1, Ticket_ID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(true);
            })
        });
    }
    async findMessageOfTicket(ticketID) {
        return new Promise((resolve, reject) => {
            let sql = `
    SELECT message.*, user.Username, role.RoleName
    FROM message
    JOIN user ON message.Answerer_ID = user.ID
    JOIN role ON user.RoleID = role.ID
    WHERE message.Ticket_ID = ?;
`;
            con.query(sql, [ticketID], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result);
            })
        });
    }
    async getAllNotAnsweredTickets(categoryID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT category.Name AS CategoryName , ticket.*  FROM ticket JOIN Category ON ticket.Category_ID = Category.ID  WHERE Category.ID = ? AND ticket.Status = ?`
            con.query(sql, [categoryID, 0], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result)
            })
        });
    }
    async Alltickets(categoryID) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ticket.* , category.Name as CategoryName FROM ticket JOIN Category ON ticket.Category_ID = Category.ID  WHERE Category.ID = ?`
            con.query(sql, [categoryID, 0], (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result)
            })
        });
    }
    async ChangeLastAnswerer(UserID, TicketID) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE ticket SET LastAnswerer_ID = ? WHERE ID = ?`
            con.query(sql, [UserID, TicketID], (err, result) => {
                if (err) {
                    return reject(err);
                }
                console.log("Query result:", result);
                return resolve(result);
            });
        });
    }
    async findImageOfPhoto(message) {
        const promises = message.map(e => {
            return new Promise((resolve, reject) => {
                let sql = `SELECT Src , Message_ID FROM images WHERE Message_ID = ?`
                con.query(sql, [e.ID], (err, result) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })
            });
        })
        return Promise.all(promises)
    }
}

module.exports = new ticketApplication