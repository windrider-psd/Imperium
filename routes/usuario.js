var express = require('express');
var database = require('./../model/DBModels')
var bcrypt = require('bcrypt');
var sanitizer = require('sanitizer')
var router = express.Router();
const conexao = database.Con;
const Usuario = database.Usuario;
const ops = conexao.Op;
/* GET home page. */
function validarEmail(email) {
  var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

router.post('/cadastrar', function(req, res) {

  var params = req.body;
  if(!(params.senha && params.confsenha && params.nick && params.email))
  {
    res.status(400).end("Parâmetros inválidos")
    return;
  }
  params.nick = sanitizer.escape(params.nick);
  params.email = sanitizer.escape(params.email);
  if(params.senha != params.confsenha)
  {
    res.status(400).end("As senhas não são iguais.");
    return;
  }
  if(params.nick.length < 4)
  {
    res.status(400).end("O nick precisa conter pelo menos 4 caracteres");
    return;
  }
  if(!validarEmail(params.email))
  {
    res.status(400).end("O email digitado não é valido");
    return;
  }
  bcrypt.hash(params.senha, 10, function(err, hash)
  {  
    if(err)
      res.status(500).end(err);
    else
    {
      Usuario.create({nick : params.nick, email : params.email.toLowerCase(), senha : hash}).then(function(data)
      {
        req.session.usuario = data.dataValues;
        res.status(200).end("Conta Cadastrada com sucesso")
      }).catch(conexao.ValidationError, function(err)
      {
        var path = err.errors[0].path;
        if(err.errors[0].type == "unique violation")
        {
          switch(path)
          {
            case "nick":
              res.status(400).end("Nick "+params.nick + " já cadastrado. Escolha outro");
              break;
            case "email":
              res.status(400).end("Email "+params.email + " já cadastrado. Escolha outro");
              break;
            default:
              res.status(500).end(err.errors[0].message);
          }
        }
        else
        {
          res.status(500).end(err.errors[i].message);
        }
      })
    }
  });
  
});

router.post('/login', function(req, res)
{

  if(!(req.body.usuario && req.body.senha))
    res.status(400).end("Parâmetros inválidos")
  else if(req.session.usuario)
    res.status(400).end("Usuário já logado")
  else
  {
    var params = req.body
    console.log(params)
    Usuario.findOne({where : 
      {
        $or:
        [
          {email : params.usuario.toLowerCase()},
          {nick : params.usuario}
        ]
      }})
     .then(function(resultado)
    {
      if(resultado)
      {
        bcrypt.compare(params.senha, resultado.senha, function(err, comparacao)
        {
          
          if(err)
            res.status(500).end(err)
          else if(comparacao)
          {
            req.session.usuario = resultado.dataValues;
            res.status(200).end("Login realizado")
          }
            
          else
            res.status(400).end("Usuário ou senha incorretos")
        })
      }
      else
        res.status(400).end("Usuario ou senha incorretos");
      
    });
   
  }
});
router.post('/logout', function(req, res)
{
  req.session.destroy(function(err)
  {
    if(err) req.status(500).end(err)
    else res.status(200).end("Logout realizado com sucesso")
  })
});

module.exports = router;
