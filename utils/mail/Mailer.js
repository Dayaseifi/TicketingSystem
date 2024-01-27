const nodemailer = require('nodemailer');
const smtptransport = require('nodemailer-smtp-transport');

const transport = smtptransport({
    host: 'mail.academytestyek.com',
    auth: {
        user: 'MojtabaRamezaniTestmail@academytestyek.com',
        pass: '1l;XCDL-7.N}'
    },
    secure: false,
    port: 465
})

const Mailsender = nodemailer.createTransport(transport)
module.exports = Mailsender

