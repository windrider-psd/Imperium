var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
/* GET home page. */

function GetPlanetasSetor(setores, resultado, __callback, i)
{
  var index = (i) ? i : 0; 
  if(index < setores.length)
  {
    var setor = setores[index];
    models.Planeta.findAll({where : {setorID : setor.id}}).then(function(planetas)
    {
      var resPush = {setor : setor.dataValues, planetas :[]};
      for(var j = 0; j < planetas.length; j++)
      {
        resPush.planetas.push(planetas[j]);
      }
      var proximo = index + 1;
      resultado.push(resPush);
      GetPlanetasSetor(setores, resultado, __callback, proximo);
    });
  }
  else
  {
    __callback(resultado)
  }

}

router.all('*', function(req, res, next)
{
  if(req.session.usuario)
  {
    models.Setor.findAll({where : {usuarioID : req.session.usuario.id}}).then(function(setores)
    {
      req.userdata = {};
      req.userdata.setores = [];
      if(setores.length > 0)
      {     
        GetPlanetasSetor(setores, [], function(resultado)
        {
          req.userdata.setores = resultado;
          next();
        });
      }
      else
      {
        next();
      }
    }); 
  }
  else
    next();
});
router.get('/', function(req, res) {
  if(req.session.usuario)
    res.render('inicial', { session: req.session.usuario, userdata : JSON.stringify(req.userdata.setores)});
  else
    res.render('login');
});
router.get('/opcoes', function(req, res)
{
  if(req.session.usuario)
    res.render('opcoes', { session: req.session.usuario, userdata : JSON.stringify(req.userdata.setores) });
  else
    res.status(403).render('login');
});

router.get('/login', function(req, res) {
  if(req.session.usuario)
    res.render('inicial', { session: req.session.usuario, userdata : JSON.stringify(req.userdata.setores)  });
  else
    res.render('login');
});
router.get('/cadastrar', function(req, res) {
  res.render('cadastrar');
});
router.get('/inicial', function(req, res) {
  if(req.session.usuario)
  {
    res.render('inicial', { session: req.session.usuario, userdata : JSON.stringify(req.userdata.setores) });
  }
  else 
    res.render('login');
});
router.get('/planeta', function(req, res) {
  if(req.session.usuario)
  {
    res.render('planeta', { session: req.session.usuario, userdata : JSON.stringify(req.userdata.setores) });
  }
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
    models.EsqeciSenha.findOne({where : {usuarioID : uid, chave : chave}}).then(function(encontrado)
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

router.get("/ativar", function(req, res)
{
  var params = req.query;
  if(!(params.u && params.chave))
  {
    res.status(400).render('ativar', {erro : 1}); //Link inválido
  }
  else if(req.session.usuario && req.session.usuario.ativo == true)
  {
    res.status(202).render('ativar', {erro : 2}); // Conta já ativada
  }
  else 
  {
    models.Usuario.findOne({where : {id : params.u}, attributes : ['id', 'ativo', 'chave_ativacao']}).then(function(user){
      if(!user)
      {
        res.status(400).render('ativar', {erro : 1}); //Link inválido
      }
      else if(user.ativo == true)
      {
        res.status(202).render('ativar', {erro : 2}); // Conta já ativada
      }
      else if(user.chave_ativacao != params.chave)
      {
        res.status(400).render('ativar', {erro : 1}); //Link inválido
      }
      else
      {
        user.ativo = true;
        user.save().then(function()
        {
          if(req.session.usuario)
          {
            req.session.usuario.ativo = true;
          }
          res.status(200).render('ativar', {erro : 0}); // Sucesso
        }).catch(function(err)
        {
          res.status(500).render('ativar', {erro : 3}); //erro ao ativar
        });
      }

    });
  }
});

module.exports = router;
