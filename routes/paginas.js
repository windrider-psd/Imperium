var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
const ranking = require('./../services/Ranking');
const Bluebird = require("bluebird");
const glob = require('glob')
require('dotenv/config')

/**
 * 
 * @param {Response} res 
 * @param {Object} params
 */
function render(view, res, params)
{
  glob('./pages/specific/'+view+'/*.pug', (err, pages) => {
    let pagename = pages[0].split('/')
    pagename = pagename[pagename.length - 1]
    paganame = pagename.split('.')[0]
    res.render(view + '/' + pagename, params)
  })
  
}


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
    getUserData(req).then(userdata => render('recursos', res, {userdata : userdata})).catch(() => render('login-cadastro', res));
  else
    render('login-cadastro', res);
});
router.get('/opcoes', (req, res) =>
{
  if(req.session.usuario)
    getUserData(req).then(userdata => render('opcoes', res, {userdata : userdata})).catch(() => render('login-cadastro', res));
  else
  { 
    res.status(403)
    render('login-cadastro', res);
  }
    
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
              render('topico-forum', res, {userdata : userdata, topico : topico})
            else
              render('inicial', res, {userdata : userdata})
          })
          .catch(() =>
            next()
          )
      }
      else
        render('inicial', res, {userdata : userdata})
    }).catch(() => render('login-cadastro', res));
  }
  else
    render('login-cadastro');
});



router.get('/recursos', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => render('recursos', res, {userdata : userdata})).catch(() => render('login-cadastro'));
  else 
  {
    res.status(403)
    render('login-cadastro', res);
  }
    
});
router.get('/alianca', (req, res) => {
  if(req.session.usuario)
  {
    models.Alianca_Aplicacao.findOne({where : {usuarioID : req.session.usuario.id}}).then(aplicacao => {
      if(!aplicacao)
        getUserData(req).then(userdata => render('alianca', res, {userdata : userdata, aplicacao : false})).catch(() => render('login-cadastro', res));
      else
      {
        models.Alianca.findOne({where : {id: aplicacao.aliancaID}, attributes :['id', 'nome', 'tag']}).then(alianca => {
          aplicacao.dataValues.alianca = alianca;
          getUserData(req).then(userdata => render('alianca', {userdata : userdata, aplicacao : aplicacao.dataValues})).catch(() => render('login-cadastro', res));
        })
      }
    })
    
  }
    
  else 
    render('login-cadastro');
});

router.get('/forum', (req, res) => {
  if(req.session.usuario)
  {
    getUserData(req)
      .then(userdata => {
        if(userdata.alianca != null)
          render('forum', res, {userdata : userdata})
        else
          req.query.planetaid != null ? res.redirect('alianca?planetaid='+req.query.planetaid) : res.redirect('alianca')
      })
      .catch(() => render('login-cadastro', res));
  }
    
  else 
   render('login-cadastro', res);
});

router.get('/ranking', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => render('ranking', res, {userdata : userdata, resultadosPorPagina : Number(process.env.RANKING_MAX_RESULTADOS)})).catch(() =>render('login-cadastro', res));
  else 
    render('login-cadastro', res);
});

router.get('/mensagens', (req, res) => {
  if(req.session.usuario)
    getUserData(req).then(userdata => render('mensagens', res, {userdata : userdata, resultadosPorPagina : Number(process.env.MESSAGE_PAGE_COUNT)})).catch(() => render('login-cadastro', res));
  else 
    render('login-cadastro', res);
});

router.get('/recuperar-senha', (req, res) =>{
  let uid = req.query.u;
  let chave = req.query.chave;

  if(!uid || !chave)
    render('recuperar-senha', res, {erro : 1})
  else
  {
    models.EsqeciSenha.findOne({where : {usuarioID : uid, chave : chave}}).then((encontrado) =>
    {
      if(!encontrado)
        render('recuperar-senha', res, {erro : 1});
      else
      {
        let agora = new Date();
        let datareq = new Date(encontrado.dataValues.data_hora);
        let diffMs = (agora - datareq); 
        let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // horas
        if(diffHrs > 72)
          render('recuperar-senha', res, {erro : 2});
        else
          render('recuperar-senha', res, {erro : 0, u : uid, chave : chave});
      }
    });
  }
});

router.get("/ativar", (req, res) =>
{
  let params = req.query;
  if(!(params.u && params.chave))
    render('ativar', res, {erro : 1}); //Link inválido
  else if(req.session.usuario && req.session.usuario.ativo == true)
    render('ativar', res, {erro : 2}); // Conta já ativada
  else 
  {
    models.Usuario.findOne({where : {id : params.u}, attributes : ['id', 'ativo', 'chave_ativacao']}).then(function(user){
      if(!user)
        render('ativar', res, {erro : 1}); //Link inválido
      else if(user.ativo == true)
       render('ativar', res, {erro : 2}); // Conta já ativada
      else if(user.chave_ativacao != params.chave)
        render('ativar', res, {erro : 1}); //Link inválido
      else
      {
        user.ativo = true;
        user.save().then(() =>
        {
          if(req.session.usuario)
            req.session.usuario.ativo = true;
         render('ativar', res, {erro : 0}); // Sucesso
        }).catch(() => render('ativar', res, {erro : 3})) //erro ao ativar
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
            models.Usuario_Participa_Alianca.count({where : {aliancaID : alianca.id}}).then(contagem => getUserData(req).then(userdata => render('paginaExterna', res, {userdata : userdata, alianca : alianca.dataValues, totalMembros : contagem, aplicacao : Boolean(aplicacao)})).catch(() => render('login-cadastro', res)))
          })
        }
      })
    }
  }
  else
    render('login-cadastro', res);
})

module.exports = router;
