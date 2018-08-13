var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../model/DBModelsUtils')
const ranking = require('./../model/Ranking');
var Bluebird = require("bluebird");
require('dotenv/config')
/**
 * @param {Request} req O objeto de requisição do express
 * @description Retorna um objeto que será usado no front-end
 * @returns {Bluebird.<{session : Object, sessionID : number, setores : Object, caixaEntrada : number}>}
 */
function getUserData(req)
{
  return new Bluebird((resolve, reject) =>
  {
    if(req.session.usuario)
    {
      ranking.GetRankingUsuario(req.session.usuario.id).then(rankusuario => {
        MUtils.GetCountCaixaDeEntrada(req.session.usuario.id).then(contagemEntrada => 
          resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, setores : req.userdata.setores, caixaEntrada : contagemEntrada})
        )
      }).catch(err => reject(err));
    }
    else
      reject("Requisição não possui sessão de usuário");
  })
}

router.all('*', (req, res, next) =>
{
  if(req.session.usuario)
  {
    models.Setor.findAll({where : {usuarioID : req.session.usuario.id}}).then(setores =>
    {
      req.userdata = {};
      req.userdata.setores = [];
      if(setores.length > 0)
      {     
        MUtils.getSetoresInfo(setores).then(resultado =>
        {
          req.userdata.setores = resultado;
          next();
        })
      }
      else
        next();
    }); 
  }
  else
    next();
});
router.get('/', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('inicial', {userdata : userdata})).catch(() => res.render('login'));
  else
    res.render('login');
});
router.get('/opcoes', (req, res) =>
{
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('opcoes', {userdata : userdata})).catch(() => res.status(403).render('login'));
  else
    res.status(403).render('login');
});

router.get('/login', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('inicial', {userdata : userdata})).catch(() => res.render('login'));
  else
    res.render('login');
});

router.get('/cadastrar', (req, res) => res.render('cadastrar'));

router.get('/inicial', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('inicial', {userdata : userdata})).catch(() => res.status(403).render('login'));
  else 
    res.status(403).render('login');
});

router.get('/planeta', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('planeta', {userdata : userdata})).catch(() => res.status(403).render('login'));
  else 
    res.render('login');
});

router.get('/ranking', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('ranking', {userdata : userdata, resultadosPorPagina : Number(process.env.RANKING_MAX_RESULTADOS)})).catch(() =>res.status(403).render('login'));
  else 
    res.render('login');
});

router.get('/mensagens', (req, res) => {
  if(req.session.usuario)
  {
    getUserData(req).then(userdata => {
      models.MensagemPrivada.findAll({
        where :
        {
          $or:
          {
            destinatario : req.session.usuario.id,
            remetente : req.session.usuario.id
          }
        }
      }).then(mensagens => {
        let mensagensRetorno = {recebidas : new Array(), enviadas : new Array()}
        let promessasAll = new Array();
        /**
         * @type {Array.<number>}
         */
        let usuariosEncontrados = new Array();

        for(let i = 0; i < mensagens.length; i++)
        {
            let esta = false;
            for(let j = 0; j < usuariosEncontrados.length; j++)
            {
              if(mensagens[i].remetente == usuariosEncontrados[j])
              {
                esta = true;
                break;
              }
            }
            if(!esta)
            {
              usuariosEncontrados.push(mensagens[i].remetente)
              promessasAll.push(new Bluebird(resolve => 
              {
                  models.Usuario.findOne({where : {id : mensagens[i].remetente}, attributes : ['id', 'nick']}).then(usuario => resolve({id : usuario.id, nome : usuario.nick}))
              }))
            }
        }

        for(let i = 0; i < mensagens.length; i++)
        {
            let esta = false;
            for(let j = 0; j < usuariosEncontrados.length; j++)
            {
              if(mensagens[i].destinatario == usuariosEncontrados[j])
              {
                esta = true;
                break;
              }
            }
            if(!esta)
            {
              usuariosEncontrados.push(mensagens[i].destinatario)
              promessasAll.push(new Bluebird(resolve => 
              {
                  models.Usuario.findOne({where : {id : mensagens[i].destinatario}, attributes : ['id', 'nick']}).then(usuario => resolve({id : usuario.id, nome : usuario.nick}))
              }))
            }
        }

        Bluebird.all(promessasAll).then(usuarios =>
        {
          for(let i = 0; i < mensagens.length; i++)
          {
            for(let j = 0; j < usuarios.length; j++)
            {
              if(mensagens[i].destinatario == req.session.usuario.id)
              {
                for(let k = 0; k < usuarios.length; k++)
                {
                  if(usuarios[k].id != req.session.usuario.id && usuarios[k].id == mensagens[i].remetente)
                  {
                    mensagensRetorno.recebidas.push({mensagem : mensagens[i], nome : usuarios[k].nome})
                    break;
                  }
                }
                break;
              }
              else
              {
                for(let k = 0; k < usuarios.length; k++)
                {
                  if(usuarios[k].id != req.session.usuario.id && usuarios[k].id == mensagens[i].destinatario)
                  {
                    delete mensagens[i].visualizada;
                    mensagensRetorno.enviadas.push({mensagem : mensagens[i], nome : usuarios[k].nome})
                    break;
                  }
                }
                break;
              }
            }
          }
          userdata['mensagensPrivadas'] = mensagensRetorno;
          res.render('mensagens', {userdata : userdata})
        });
        
      });
    })
    .catch(() => res.status(403).render('login'));
  }
    
  else 
    res.render('login');
});

router.get('/recuperar-senha', (req, res) =>{
  let uid = req.query.u;
  let chave = req.query.chave;

  if(!uid || !chave)
    res.render('recuperar-senha', {erro : 1})
  else
  {
    models.EsqeciSenha.findOne({where : {usuarioID : uid, chave : chave}}).then((encontrado) =>
    {
      if(!encontrado)
        res.render('recuperar-senha', {erro : 1});
      else
      {
        let agora = new Date();
        let datareq = new Date(encontrado.dataValues.data_hora);
        let diffMs = (agora - datareq); 
        let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // horas
        if(diffHrs > 72)
          res.render('recuperar-senha', {erro : 2});
        else
          res.render('recuperar-senha', {erro : 0, u : uid, chave : chave});
      }
    });
  }
});

router.get("/ativar", (req, res) =>
{
  let params = req.query;
  if(!(params.u && params.chave))
    res.status(400).render('ativar', {erro : 1}); //Link inválido
  else if(req.session.usuario && req.session.usuario.ativo == true)
    res.status(202).render('ativar', {erro : 2}); // Conta já ativada
  else 
  {
    models.Usuario.findOne({where : {id : params.u}, attributes : ['id', 'ativo', 'chave_ativacao']}).then(function(user){
      if(!user)
        res.status(400).render('ativar', {erro : 1}); //Link inválido
      else if(user.ativo == true)
        res.status(202).render('ativar', {erro : 2}); // Conta já ativada
      else if(user.chave_ativacao != params.chave)
        res.status(400).render('ativar', {erro : 1}); //Link inválido
      else
      {
        user.ativo = true;
        user.save().then(() =>
        {
          if(req.session.usuario)
            req.session.usuario.ativo = true;
          res.status(200).render('ativar', {erro : 0}); // Sucesso
        }).catch(() => res.status(500).render('ativar', {erro : 3})) //erro ao ativar
      }
    });
  }
});

module.exports = router;
