var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
const ranking = require('./../services/Ranking');
const Bluebird = require("bluebird");
require('dotenv/config')
/**
 * @param {Request} req O objeto de requisição do express
 * @description Retorna um objeto que será usado no front-end
 * @returns {Bluebird.<{session : Object, sessionID : number, setores : Object, alianca : null|Object, caixaEntrada : number}>}
 */
function getUserData(req)
{
  return new Bluebird((resolve, reject) =>
  {
    if(req.session.usuario)
    {
      ranking.GetRankingUsuario(req.session.usuario.id).then(rankusuario => {
        MUtils.GetCountCaixaDeEntrada(req.session.usuario.id).then(contagemEntrada => 
          models.Usuario_Participa_Alianca.findOne({where:{usuarioID: req.session.usuario.id}}).then(participa => {
            if(participa){
              models.Alianca.findOne({where: {id : participa.aliancaID}}).then(alianca =>{
                models.Usuario_Participa_Alianca.count({where : {aliancaID : alianca.id}}).then(contagem => {
                  alianca.dataValues.totalMembros = contagem;
                  if(alianca.dataValues.paginaExterna != null)
                    alianca.dataValues.paginaExterna = alianca.dataValues.paginaExterna.replace(/(?:\r\n|\r|\n)/g, '');
                  if(alianca.dataValues.paginaInterna != null)
                    alianca.dataValues.paginaInterna = alianca.dataValues.paginaInterna.replace(/(?:\r\n|\r|\n)/g, '');
                  if(participa.rank !== null)
                  {
                    models.Alianca_Rank.findOne({where : {id : participa.rank}}).then(rank =>
                    {
                      alianca.dataValues.rank = rank;
                      resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, alianca : alianca, setores : req.userdata.setores, caixaEntrada : contagemEntrada})
                    })
                  }
                  else
                  {
                    alianca.dataValues.rank = null
                    resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, alianca : alianca, setores : req.userdata.setores, caixaEntrada : contagemEntrada})
                  }
                })
                
              })
            }
            else
              resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, alianca : null, setores : req.userdata.setores, caixaEntrada : contagemEntrada})
          })
          
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
    getUserData(req).then(userdata => res.render('recursos', {userdata : userdata})).catch(() => res.render('login'));
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

router.get('/topico-forum', (req, res, next) => {
  if(req.session.usuario)
  {
    getUserData(req).then(userdata => {
      if(!userdata.alianca != null && typeof(req.query.topicoid) != 'undefined')
      {
        models.Forum_Topico.findOne({where : {aliancaID : userdata.alianca.id, id : req.query.topicoid}})
          .then(topico =>{
            if(topico)
              res.render('topico-forum', {userdata : userdata, topico : topico})
            else
              res.render('inicial', {userdata : userdata})
          })
          .catch(() =>
            next()
          )
      }
      else
        res.render('inicial', {userdata : userdata})
    }).catch(() => res.render('login'));
  }
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

router.get('/recursos', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('recursos', {userdata : userdata})).catch(() => res.status(403).render('login'));
  else 
    res.status(403).render('login');
});
router.get('/alianca', (req, res) => {
  if(req.session.usuario)
  {
    models.Alianca_Aplicacao.findOne({where : {usuarioID : req.session.usuario.id}}).then(aplicacao => {
      if(!aplicacao)
        getUserData(req).then(userdata => res.render('alianca', {userdata : userdata, aplicacao : false})).catch(() => res.status(403).render('login'));
      else
      {
        models.Alianca.findOne({where : {id: aplicacao.aliancaID}, attributes :['id', 'nome', 'tag']}).then(alianca => {
          aplicacao.dataValues.alianca = alianca;
          getUserData(req).then(userdata => res.render('alianca', {userdata : userdata, aplicacao : aplicacao.dataValues})).catch(() => res.status(403).render('login'));
        })
      }
    })
    
  }
    
  else 
    res.status(403).render('login');
});

router.get('/forum', (req, res) => {
  if(req.session.usuario)
  {
    getUserData(req)
      .then(userdata => {
        if(userdata.alianca != null)
          res.render('forum', {userdata : userdata})
        else
          req.query.planetaid != null ? res.redirect('alianca?planetaid='+req.query.planetaid) : res.redirect('alianca')
      })
      .catch(() => res.status(403).render('login'));
  }
    
  else 
    res.status(403).render('login');
});

router.get('/ranking', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('ranking', {userdata : userdata, resultadosPorPagina : Number(process.env.RANKING_MAX_RESULTADOS)})).catch(() =>res.status(403).render('login'));
  else 
    res.status(403).render('login');
});

router.get('/mensagens', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => res.render('mensagens', {userdata : userdata, resultadosPorPagina : Number(process.env.MESSAGE_PAGE_COUNT)})).catch(() => res.status(403).render('login'));
  else 
    res.status(403).render('login');
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


router.get('/paginaExterna', (req, res) => {
  if(req.session.usuario)
  {
    if(!req.query.id)
      res.redirect(400, '/alianca');
    else
    {
      models.Alianca.findOne({where : {id:req.query.id}}).then(alianca => {
        if(!alianca)
          res.redirect(400, '/alianca');
        else
        {
          models.Alianca_Aplicacao.findOne({where : {usuarioID : req.session.usuario.id}}).then(aplicacao => {
            models.Usuario_Participa_Alianca.count({where : {aliancaID : alianca.id}}).then(contagem => getUserData(req).then(userdata => res.render('paginaExterna', {userdata : userdata, alianca : alianca.dataValues, totalMembros : contagem, aplicacao : Boolean(aplicacao)})).catch(() => res.render('login')))
          })
        }
      })
    }
  }
  else
    res.render('login');
})

module.exports = router;
