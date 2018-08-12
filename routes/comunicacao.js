var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const sanitizer = require("sanitizer")
const io = require('./../model/io')
require('dotenv/config')
router.post('/enviar-mensagem-privada', (req, res) =>
{
  /**
   * @type {{destinatario: number, assunto : string ,mensagem : string}}
   */
  let params = req.body;
  if(!req.session.usuario)
    res.status(403).end("Operação inválida")
  else if(!params.destinatario || !params.mensagem)
    res.status(400).end("Parâmetros inválidos")
  else if(isNaN(params.destinatario) || typeof(params.mensagem) !== 'string' || typeof(params.assunto) !== 'string')
    res.status(400).end("Parâmetros inválidos")
  else if(params.destinatario == req.session.usuario.id || params.mensagem == '')
    res.status(400).end("Parâmetros inválidos")
  else if(params.mensagem.length > Number(process.env.MESSAGE_SUBJECT_MAX_LENGTH))
    res.status(400).end("Mensagem muito longa")
  else if(params.assunto.length > Number(process.env.MESSAGE_CONTENT_MAX_LENGTH))
    res.status(400).end("Assunto da mensagem muito longo")
  else
  {
    if(params.assunto == '')
      params.assunto = undefined
    else
      params.assunto = sanitizer.escape(params.assunto)
    models.MensagemPrivada.create({
      remetente : req.session.usuario.id, 
      destinatario : params.destinatario,
      assunto : params.assunto,
      mensagem : sanitizer.escape(params.mensagem)
    }).then(mensagem => {
      io.EmitirParaSessao(params.destinatario, 'mensagem-privada', mensagem)
      res.status(200).end("Mensagem enviada com sucesso")
    }).catch(err => res.status(500).end(err));
  }
});

module.exports = router;
