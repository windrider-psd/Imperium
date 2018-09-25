var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
const path = require('path')
require('dotenv/config')
/**
 * 
 * @param {Response} res 
 * @param {Object} params
 */
function render(view, res)
{
  res.sendFile(path.resolve('public/dist/'+view+'.html')); 
}

router.get('/', (req, res) => {
  if(req.session.usuario)
    MUtils.GetUserData(req).then(userdata => render('recursos', res, {})).catch((err) =>{ render('login-cadastro', res), console.log(err) });
  else
    render('login-cadastro', res);
});
router.get('/opcoes', (req, res) =>
{
  if(req.session.usuario)
    MUtils.GetUserData(req).then(userdata => render('opcoes', res, {})).catch(() => render('login-cadastro', res));
  else
  { 
    res.status(403)
    render('login-cadastro', res);
  }
    
});


router.get('/topico-forum', (req, res, next) => {
  if(req.session.usuario)
  {
    MUtils.GetUserData(req).then(userdata => {
      if(!userdata.alianca != null && typeof(req.query.topicoid) != 'undefined')
      {
        models.Forum_Topico.findOne({where : {aliancaID : userdata.alianca.id, id : req.query.topicoid}})
          .then(topico =>{
            if(topico)
              render('topico-forum', res, {topico : topico})
            else
              render('inicial', res, {})
          })
          .catch(() =>
            next()
          )
      }
      else
        render('inicial', res, {})
    }).catch(() => render('login-cadastro', res));
  }
  else
    render('login-cadastro');
});



router.get('/recursos', (req, res) => {
  if(req.session.usuario)
    MUtils.GetUserData(req).then(userdata => render('recursos', res, {})).catch(() => render('login-cadastro'));
  else 
  {
    res.status(403)
    render('login-cadastro', res);
  }
    
});
router.get('/alianca', (req, res) => {
  if(req.session.usuario)
  {
      MUtils.GetUserData(req).then(userdata => render('alianca', res)).catch(() => render('login-cadastro', res));

  }
    
  else 
    render('login-cadastro');
});

router.get('/forum', (req, res) => {
  if(req.session.usuario)
  {
    MUtils.GetUserData(req)
      .then(userdata => {
        if(userdata.alianca != null)
          render('forum', res, {})
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
    MUtils.GetUserData(req).then(userdata => render('ranking', res, {resultadosPorPagina : Number(process.env.RANKING_MAX_RESULTADOS)})).catch(() =>render('login-cadastro', res));
  else 
    render('login-cadastro', res);
});

router.get('/mensagens', (req, res) => {
  if(req.session.usuario)
    MUtils.GetUserData(req).then(userdata => render('mensagens', res, {resultadosPorPagina : Number(process.env.MESSAGE_PAGE_COUNT)})).catch(() => render('login-cadastro', res));
  else 
    render('login-cadastro', res);
});

router.get('/recuperar-senha', (req, res) =>{
  render('recuperar-senha', res)
});

router.get("/ativar", (req, res) =>
{
  render('ativar', res)
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
            models.Usuario_Participa_Alianca.count({where : {aliancaID : alianca.id}}).then(contagem => MUtils.GetUserData(req).then(userdata => render('paginaExterna', res, {alianca : alianca.dataValues, totalMembros : contagem, aplicacao : Boolean(aplicacao)})).catch(() => render('login-cadastro', res)))
          })
        }
      })
    }
  }
  else
    render('login-cadastro', res);
})



module.exports = router;
