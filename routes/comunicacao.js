var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const sanitizer = require("sanitizer")
const io = require('./../model/io')
var Bluebird = require('bluebird');
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
  else if(params.mensagem.length > Number(process.env.MESSAGE_CONTENT_MAX_LENGTH))
    res.status(400).end("Mensagem muito longa")
  else if(params.assunto.length > Number(process.env.MESSAGE_SUBJECT_MAX_LENGTH))
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

router.get('/getInbox', (req, res) => {
  /**
   * @type {{pagina : number}}
   */
  let params = req.query;
  if(!req.session.usuario)
    res.status(403).end("Operação inválida")
  else if(!params.pagina)
    res.status(400).end("Parâmetros inválidos")
  else if(isNaN(params.pagina))
    res.status(400).end("Parâmetros inválidos")
  else
  {
    models.MensagemPrivada.findAndCountAll({where : {destinatario : req.session.usuario.id}, offset : (Number(params.pagina) - 1) * Number(process.env.MESSAGE_PAGE_COUNT), limit : Number(process.env.MESSAGE_PAGE_COUNT), order : [['id', 'DESC']]}).then(resultado =>{
        let mensagens = resultado.rows
        let total = resultado.count
        /**
         * @type {Array.<number>}
         * @description Array de ids de usuários. Serve para economizar o número de queries.
         */
        let usuariosEncontrados = new Array()
        /**
         * @type {Array.<Promise.<{id : number, nick : string}>>}
         * @description Array que armazena todas as promessas de encontrar o nick dos remetentes
         */
        let promessasAll = new Array()
        for(let i = 0; i < mensagens.length; i++)
        {
            let esta = false;
            for(let j = 0; j < usuariosEncontrados.length; j++)
            {
              if(mensagens[i].remetente == usuariosEncontrados[j].id)
              {
                esta = true;
                break;
              }
            }
            if(!esta)
            {
              usuariosEncontrados.push(mensagens[i].remetente)
              
              promessasAll.push(new Bluebird(resolve =>  models.Usuario.findOne({where : {id : mensagens[i].remetente}, attributes : ['id', 'nick']}).then(usuario => resolve({id : usuario.id, nick : usuario.nick}))))
            }
        }
        Bluebird.all(promessasAll).then(usuarios => {
          for(let i = 0; i< mensagens.length; i++)
          {
            for(let j = 0; j < usuarios.length; j++)
            {
              if(usuarios[j].id == mensagens[j].remetente)
              {
                mensagens[i].dataValues.nick = usuarios[j].nick
                break
              }
            }
          }
          res.status(200).json({mensagens : mensagens, total : total})
        })
    })
  }
})

router.get('/getOutbox', (req, res) => {
  /**
   * @type {{pagina : number}}
   */
  let params = req.query;
  if(!req.session.usuario)
    res.status(403).end("Operação inválida")
  else if(!params.pagina)
    res.status(400).end("Parâmetros inválidos")
  else if(isNaN(params.pagina))
    res.status(400).end("Parâmetros inválidos")
  else
  {
    models.MensagemPrivada.findAndCountAll({where : {remetente : req.session.usuario.id}, offset : (Number(params.pagina) - 1) * Number(process.env.MESSAGE_PAGE_COUNT), limit : Number(process.env.MESSAGE_PAGE_COUNT), order : [['id', 'DESC']]}).then(resultado =>{
        let mensagens = resultado.rows
        let total = resultado.count
        /**
         * @type {Array.<number>}
         * @description Array de ids de usuários. Serve para economizar o número de queries.
         */
        let usuariosEncontrados = new Array()
        /**
         * @type {Array.<Promise.<{id : number, nick : string}>>}
         * @description Array que armazena todas as promessas de encontrar o nick dos remetentes
         */
        let promessasAll = new Array()
        for(let i = 0; i < mensagens.length; i++)
        {
            let esta = false;
            for(let j = 0; j < usuariosEncontrados.length; j++)
            {
              if(mensagens[i].destinatario == usuariosEncontrados[j].id)
              {
                esta = true;
                break;
              }
            }
            if(!esta)
            {
              usuariosEncontrados.push(mensagens[i].destinatario)
              
              promessasAll.push(new Bluebird(resolve =>  models.Usuario.findOne({where : {id : mensagens[i].destinatario}, attributes : ['id', 'nick']}).then(usuario => resolve({id : usuario.id, nick : usuario.nick}))))
            }
        }
        Bluebird.all(promessasAll).then(usuarios => {
          for(let i = 0; i< mensagens.length; i++)
          {
            for(let j = 0; j < usuarios.length; j++)
            {
              if(usuarios[j].id == mensagens[j].destinatario)
              {
                delete mensagens[i].dataValues.visualizada
                mensagens[i].dataValues.nick = usuarios[j].nick
                break
              }
            }
          }
          res.status(200).json({mensagens : mensagens, total : total})
        })
    })
  }
})

router.post('/setInboxVisualizada', (req, res) =>{
  /**
   * @type {{id : number}}
   */
  let params = req.body;
  if(!req.session.usuario)
    res.status(403).end("Operação inválida")
  else if(!params.id)
    res.status(400).end("Parâmetros inválidos")
  else if(isNaN(params.id))
    res.status(400).end("Parâmetros inválidos")
  else
    models.MensagemPrivada.update({visualizada : true}, {where : {destinatario: req.session.usuario.id, id : Number(params.id)}}).then(() => res.status(200).end("")).catch((err) => res.status(500).end(err))
})

module.exports = router;
