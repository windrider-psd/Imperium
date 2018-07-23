var express = require('express');
var database = require('./../model/DBModels')
var bcrypt = require('bcrypt');
var router = express.Router();
const conexao = database.Con;
const Usuario = database.Usuario;
/* GET home page. */
function validarEmail(email) {
  var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

router.post('/cadastrar', function(req, res) {

  var params = req.body;
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
  var hash = bcrypt.hashSync(params.senha, 10)

  Usuario.create({nick : params.nick, email : params.email.toLowerCase(), senha : hash}).then(function(data)
  {
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
    
  });
  
});


module.exports = router;
