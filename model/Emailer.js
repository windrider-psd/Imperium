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


/**
 * 
 * @param {string} destino O endereço de email do destinatário
 * @param {string} assunto O assunto da mensagem
 * @param {string} conteudo O conteudo da mensagem
 * @param {function(err, info):void} __callback Callback(err, info) chamado quando o envio terminar
 */
function enviarEmail (destino, assunto, conteudo, __callback)
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
    });
}

/**
 * @param {String} email O email a ser validado
 * @description Analisa o email fornecido e retorna true se for valido e false se não for valido
 * @returns {boolean}
 */
function validarEmail(email)
{
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
}
module.exports = {
    enviarEmail : enviarEmail,
    validarEmail : validarEmail
}