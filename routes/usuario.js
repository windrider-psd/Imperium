var express = require('express');
const database = require('./../model/DBModels')
var bcrypt = require('bcrypt');
var sanitizer = require('sanitizer')
var emailer = require('./../model/Emailer')
var router = express.Router();
const conexao = database.Con;
const Usuario = database.Usuario;
const Esqueci = database.EsqeciSenha;
/* GET home page. */
function validarEmail(email) {
  var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return re.test(String(email).toLowerCase());
}

function GerarChaveEsqueci()
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 60; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function getMensagemEsqueci(req, u, chave)
{
  var link = req.protocol + "://"+req.headers.host+"/recuperar-senha?u="+u+"&chave="+chave;
  return "<html><head></head><body><p>Você recebeu essa mensagem porque você requisitou a recuperação da sua senha no jogo Imperium.</p>"
  + "<p>Para acessar alterar sua senha, clique no link abaixo</p>"
  +  "<a href = "+link+">"+link+"</a><br /><p>Caso esteja enfrentando alguma dificuldade, contacte o suporte</p><p>Se você não requisitou a recuperação da sua senha, por favor, ignore esta mensagem</p></body></html>";
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

router.post('/criaresqueci', function(req, res)
{
  var params = req.body;
  if(req.session.usuario)
  {
    res.status(403).end("Requisição inválida");
  }
  else if(!params.email)
  {
    res.status(400).end("Parâmetros inválidos");
  }
  else if(!validarEmail(params.email))
  {
    res.status(400).end("Email inválido");
  }
  else
  {
    Usuario.findOne({where: {email : params.email.toLowerCase()}}).then(function(user)
    { 
      if(!user)
      {
        res.status(400).end('Nenhuma conta em este endereço de email');
      }
      else
      {
        valores = user.dataValues;
        Esqueci.destroy({where : {usuarioID : valores.id}}).then(function()
        {
          var chave = GerarChaveEsqueci();
          Esqueci.create({chave : chave, usuarioID : valores.id}).then(function(criado)
          {
              var mensagem = getMensagemEsqueci(req, valores.id, criado.dataValues.chave);
              
              emailer.enviarEmail(valores.email, "Imperium - Recuperação de senha", mensagem, function(err, info)
              {
                if(err)
                {
                  res.status(500).end("falha ao enviar email")
                  console.err(err);
                  criado.destroy();
                }
                else
                {
                  res.status(200).end("Requisição criada com sucesso")
                  console.log(info)
                }
              });
          }).catch(function(err){
            res.status(500).end(err);

          });
        });
      }
    });
  }
});

router.post('/reenviaresqueci', function(req, res)
{
  var params = req.body;
  if(req.session.usuario)
  {
    res.status(403).end("Requisição inválida");
  }
  else if(!params.email)
  {
    res.status(400).end("Parâmetros inválidos");
  }
  else if(!validarEmail(params.email))
  {
    res.status(400).end("Email inválido");
  }
  else
  {
    Usuario.findOne({where: {email : params.email.toLowerCase()}}).then(function(user)
    {
      if(user)
      {
        Esqueci.findOne({where : {usuarioID : user.dataValues.id}}).then(function(encontrado)
        {
          if(encontrado)
          {
              var mensagem = getMensagemEsqueci(req, user.dataValues.id, encontrado.dataValues.chave);
              emailer.enviarEmail(user.dataValues.email, "Imperium - Recuperação de senha", mensagem, function(err, info)
              {
                if(err)
                {
                  res.status(500).end("falha ao enviar email")
                  console.err(err);
                  criado.destroy();
                }
                else
                {
                  res.status(200).end("Requisição criada com sucesso")
                  console.log(info);
                }
              });
          }
          else
          {
            res.status(400).end("Requisição inválida");
          }
        });
      }
      else
      {
        res.status(400).end('Nenhuma conta em este endereço de email');
      }
    });
  }
});

router.post('/resetar-senha', function(req, res)
{
  var params = req.body;
  if(req.session.usuario)
  {
    res.status(403).end("Requisição inválida");
  }
  else if(!(params.senha && params.confsenha && params.id && params.chave))
  {
    res.status(400).end("Parâmetros inválidos");
  }
  else if(params.senha != params.confsenha)
  {
    res.status(400).end("As senhas não são iguais");
  }
  else
  {
    Esqueci.findOne({where : {usuarioID : params.id, chave : params.chave}}).then(function(resultado)
    {
      if(!resultado)
      {
        res.status(400).end("Requisição inválida");
      } 
      else
      {
        bcrypt.hash(params.senha, 10, function(err, hash)
        {
          if(err)
          {
            res.status(500).end(err);
          }
          else
          {
            Usuario.update({senha : hash}, {where : {id : params.id}, limit : 1}).then(function()
            {
              res.status(200).end("Senha atualizada com sucesso");
              resultado.destroy();
            }).catch(function(err)
            {
              res.status(500).end(err);
            });
          }
        });
      }
    });
  }
});


module.exports = router;
