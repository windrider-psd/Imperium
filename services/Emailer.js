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
    },
    tls:{
        rejectUnauthorized : false
    }
});


/**
 * 
 * @param {String} destino O endereço de email do destinatário
 * @param {String} assunto O assunto da mensagem
 * @param {String} conteudo O conteudo da mensagem
 * @param {Function} __callback callback(err, info)
 */
function EnviarEmail (destino, assunto, conteudo, __callback)
{
    var opcoes = {
        from : process.env.EMAIL_USER,
        to : destino,
        subject: assunto,
        html: conteudo
    };

    transportador.sendMail(opcoes, function(err, info)
    {
        if(__callback)
            __callback(err, info);   
        console.log(err)
    });
}


/**
 * @param {String} email O email a ser validado
 * @description Analisa o email fornecido e retorna true se for valido e false se não for valido
 * @returns {boolean}
 */
function ValidarEmail(email)
{
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
}
module.exports = {
    EnviarEmail : EnviarEmail,
    ValidarEmail : ValidarEmail
}