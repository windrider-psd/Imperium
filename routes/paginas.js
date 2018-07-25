var express = require('express');
var router = express.Router();
const database = require('./../model/DBModels')
const Esqueci = database.EsqeciSenha;
/* GET home page. */
router.get('/', function(req, res) {
  if(req.session.usuario)
    res.render('inicial', { session: req.session.usuario });
  else
    res.render('login');
});
router.get('/login', function(req, res) {
  if(req.session.usuario)
    res.render('inicial', { session: req.session.usuario });
  else
    res.render('login');
});
router.get('/cadastrar', function(req, res) {
  res.render('cadastrar');
});
router.get('/inicial', function(req, res) {
  if(req.session.usuario) 
    res.render('inicial', { session: req.session.usuario });
  else 
    res.render('login');
});

router.get('/recuperar-senha', function(req, res){
  var uid = req.query.u;
  var chave = req.query.chave;

  if(!uid || !chave)
  {
    res.render('recuperar-senha', {erro : 1});
  }
  else
  {
    Esqueci.findOne({where : {usuarioID : uid, chave : chave}}).then(function(encontrado)
    {
      if(!encontrado)
      {
        res.render('recuperar-senha', {erro : 1});
      }
      else
      {
        var agora = new Date();
        var datareq = new Date(encontrado.dataValues.data_hora);
        var diffMs = (agora - datareq); 
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        console.log(diffHrs);
        if(diffHrs > 72)
        {
          res.render('recuperar-senha', {erro : 2});
        }
        else
        {
          res.render('recuperar-senha', {erro : 0, u : uid, chave : chave});
        }
       
      }
    });
  }

});


module.exports = router;
