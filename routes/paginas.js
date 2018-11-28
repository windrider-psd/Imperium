let express = require('express');
let router = express.Router();
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
  res.sendFile(path.resolve('dist/'+view+'.html')); 
}

router.get('/', (req, res) => {
  if(req.session.usuario)
    render('recursos', res)
  else
    render('login-cadastro', res);
});
router.get('/opcoes', (req, res) =>
{
  if(req.session.usuario)
    render('opcoes', res);
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
   render('recursos', res);
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
    render('ranking', res);
  else 
    render('login-cadastro', res);
});

router.get('/mensagens', (req, res) => {
  if(req.session.usuario)
    render('mensagens', res);
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
      render('paginaExterna', res)
    }
  }
  else
    render('login-cadastro', res);
})


router.get('/galaxia', (req, res) => {
  if(req.session.usuario)
    render('galaxia', res);
  else 
    render('login-cadastro', res);
});

router.get('/militar', (req, res) => {
  if(req.session.usuario)
    render('militar', res);
  else 
    render('login-cadastro', res);
});

router.get('/operacoes', (req, res) => {
  if(req.session.usuario)
    render('operacoes', res);
  else 
    render('login-cadastro', res);
})

module.exports = router;
