const express = require('express');
const path = require('path');
const cookieparser = require('cookie-parser');


const app = express()
require('dotenv').config({ path: path.join(__dirname, 'config', '.env') });



const { connecting } = require('./model/DB');
const authrouter = require('./routes/auth.router');
const errorhandlers = require('./utils/errors/errorhandlers');
const ticketrouter = require('./routes/ticket.router');
const adminrouter = require('./routes/admin.router');

connecting()

app.use(express.json())
app.use('/public/upload' , express.static(path.join(__dirname, 'public', 'upload')))
app.use(cookieparser())

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Hello world"
    })
})

app.use("/auth", authrouter)
app.use('/ticket' , ticketrouter)
app.use("/admin" , adminrouter)
const port = process.env.PORT || 8000

app.use(errorhandlers.error404)
app.use(errorhandlers.unexceptionError)

app.listen(port, () => {
    console.log(`project running on port ${port}`);
})