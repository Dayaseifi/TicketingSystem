const mysql = require('mysql');

const DBconfigs = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: '',
    port: +process.env.DB_PORT,
    database: process.env.DB_NAME,
}

const con = mysql.createConnection(DBconfigs)

const connecting = () => {
    con.connect(err => {
        if (err) {
            console.log(err);
            process.exit(1);
        } else {
            console.log('Connected to the database => ' + DBconfigs.database);
        }
    });
    let query = `CREATE TABLE IF NOT EXISTS User (
        ID       INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(100) NOT NULL,
        Email    VARCHAR(100) NOT NULL unique,
        Password VARCHAR(255) NOT NULL,
        Refresh_token VARCHAR(255),
        RoleID INT NOT NULL,
        FOREIGN KEY (RoleID) REFERENCES Role(ID)
        );`
    con.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    })
    query = `CREATE TABLE IF NOT EXISTS Role (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        RoleName VARCHAR(100) NOT NULL
    );`
    con.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    })
    query = `CREATE TABLE IF NOT EXISTS Category (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Name Varchar(255) NOT NULL
    );`
    con.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    })

    query = `CREATE TABLE IF NOT EXISTS Ticket (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Questioner_ID INT NOT NULL,
        LastAnswerer_ID INT,
        Category_ID INT NOT NULL,
        Status BOOLEAN NOT NULL DEFAULT false,
        FOREIGN KEY (LastAnswerer_ID) REFERENCES User(ID),
        FOREIGN KEY (Questioner_ID) REFERENCES User(ID),
        FOREIGN KEY (Category_ID) REFERENCES Category(ID)
    );`
    con.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    })
    query = `CREATE TABLE IF NOT EXISTS Message (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Title VARCHAR(255) NOT NULL,
        Content LONGTEXT NOT NULL,
        Answerer_ID INT NOT NULL,
        Ticket_ID INT NOT NULL,
        FOREIGN KEY (Ticket_ID) REFERENCES Ticket(ID),
        FOREIGN KEY (Answerer_ID) REFERENCES User(ID)
    );`
    con.query(query, (err, res) => {
        if (err) {
            console.log(err);
        }
    })
    query = `CREATE TABLE IF NOT EXISTS images(
        ID INT AUTO_INCREMENT PRIMARY KEY,
        Src LONGTEXT NOT NULL,
        Filename LONGTEXT NOT NULL,
        Message_ID INT,
        FOREIGN KEY (Message_ID) REFERENCES Message(ID) 
    );
    `
    con.query(query , (err , res) => {
        if (err) {
            console.log(err);
        }
    })
}

module.exports = {
    con, connecting
}