const nodemailer = require('nodemailer')
require('dotenv/config')
const transportador =  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth : 
    {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASSWORD
    }   
});
var enviar = function (destino, assunto, mensagem, __callback)
{
    var opcoes = {
        from : process.env.EMAIL_USER,
        to : destino,
        subject: assunto,
        html: mensagem
    };

    transportador.sendMail(opcoes, function(err, info)
    {
        if(__callback)
            __callback(err, info);   
    });
}

module.exports = {
    enviarEmail : enviar
}