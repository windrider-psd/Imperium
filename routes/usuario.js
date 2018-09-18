var express = require('express');
var router = express.Router();
const database = require('./../model/DBModels')
const bcrypt = require('bcrypt');
const sanitizer = require('sanitizer')
const emailer = require('./../services/Emailer')
const random = require('./../services/Aleatorio')
const conexao = database.Con;
const Usuario = database.Usuario;
const Esqueci = database.EsqeciSenha;
const Setor = database.Setor;
const Planeta = database.Planeta;
const ranking = require('./../services/Ranking')
require('dotenv/config')

function getMensagemEsqueci(req, u, chave)
{
  let link = req.protocol + "://"+req.headers.host+"/recuperar-senha?u="+u+"&chave="+chave;
  return "<html><head></head><body><p>Você recebeu essa mensagem porque você requisitou a recuperação da sua senha no jogo Imperium.</p>"
  + "<p>Para acessar alterar sua senha, clique no link abaixo</p>"
  +  "<a href = "+link+">"+link+"</a><br /><p>Caso esteja enfrentando alguma dificuldade, contacte o suporte</p><p>Se você não requisitou a recuperação da sua senha, por favor, ignore esta mensagem</p></body></html>";
}

function getMensagemTrocaEmail()
{
  return "<html><head></head><body><p>Você recebeu essa mensagem porque você trocou o email no jogo Imperium.</p>"
  +  "<p>Se este email não é para você, por favor, ignore esta mensagem</p></body></html>";
}

function getMensagemTrocaSenha()
{
  return "<html><head></head><body><p>Você recebeu essa mensagem porque você trocou sua senha no jogo Imperium.</p>"
  +  "<p>Se este email não é para você, por favor, ignore esta mensagem</p></body></html>";
}

function EnviarEmailAtivacao(req, id, chave, email)
{
  let link = req.protocol + "://"+req.headers.host+"/ativar?u="+id+"&chave="+chave;
  let mensagem = "<html><head></head><body><p>Você recebeu essa mensagem porque você criou uma conta no jogo Imperium.</p>"
  + "<p>Para ativar sua senha, clique no link abaixo</p>"
  +  "<a href = "+link+">"+link+"</a><br /><p>Caso esteja enfrentando alguma dificuldade, contacte o suporte</p><p>Se esta mensagem não para você, por favor, ignore esta mensagem</p></body></html>";
  emailer.EnviarEmail(email, "Imperium - Ativar Conta", mensagem, (err, info) =>
  {
    if(err) console.log(err)
    console.log(info);
   });
}

router.post('/cadastrar', function(req, res) {
  conexao.query("SELECT * FROM setors as setor WHERE setor.planetario = 1 and setor.usuarioID is NULL and exists(SELECT * FROM planeta as plat where plat.habitavel = 1 and plat.setorID = setor.id)").spread((setores) =>
  {
    if(setores.length == 0)
      res.status(503).end("Numero máximo de contas cadastradas alcançado");
    else
    {
      let params = req.body;

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
      if(!emailer.ValidarEmail(params.email))
      {
        res.status(400).end("O email digitado não é valido");
        return;
      }
      bcrypt.hash(params.senha, 10, (err, hash) =>
      { 
        if(err)
          res.status(500).end(err);
        else
        {
         conexao.transaction().then((transacao) =>
         {
          Usuario.create({nick : params.nick, email : params.email, senha : hash, chave_ativacao : random.GerarStringAleatoria(60)}, {transaction : transacao}).then((data) =>
          {
            let setorInicial = setores[random.GerarIntAleatorio(setores.length - 1, 0)]
            Setor.update({usuarioID : data.id}, {where : {id : setorInicial.id}, transaction: transacao}).then(() =>
            {
              Planeta.findAll({where : {setorID : setorInicial.id}, transaction: transacao}).then((planetas) =>{
                let planetaInicial = planetas[random.GerarIntAleatorio(planetas.length - 1, 0)]
                Planeta.update({colonizado : true, recursoFerro : 500, recursoCristal : 300, recursoEletronica : 200, recursoUranio: 100, recursoComida : 500 }, {where : {id : planetaInicial.id}, transaction: transacao}).then(() =>
                {
                  transacao.commit()
                  req.session.usuario = data.dataValues
                  res.status(200).end("Conta Cadastrada com sucesso")
                  EnviarEmailAtivacao(req, data.id, data.chave_ativacao, data.email)
                }).catch(() =>
                {
                  transacao.rollback();
                  res.status(500).end("Houve um erro ao criar a conta");
                });
              }).catch(() =>
              {
                transacao.rollback();
                res.status(500).end("Houve um erro ao criar a conta");
              });
            }).catch(() =>
            {
              transacao.rollback()
              res.status(500).end("Houve um erro ao criar a conta")
            });
          }).catch(conexao.ValidationError, (err) =>
          {
            transacao.rollback()
            let path = err.errors[0].path
            if(err.errors[0].type == "unique violation")
            {
              switch(path)
              {
                case "nick":
                  res.status(400).end("Nick "+params.nick + " já cadastrado. Escolha outro")
                  break
                case "email":
                  res.status(400).end("Email "+params.email + " já cadastrado. Escolha outro")
                  break
                default:
                  res.status(500).end(err.errors[0].message)
              }
            }
            else
              res.status(500).end(err.errors[i].message)
          })
         }); 
        }
      });
    }
  });
});

router.post('/login', (req, res) =>
{
  let tratarLogin = () =>
  {
    let params = req.body
    params.nick = sanitizer.escape(params.nick)
    params.email = sanitizer.escape(params.email)
    Usuario.findOne({where : 
      {
        $or:
        [
          {email : params.usuario},
          {nick : params.usuario}
        ]
      }})
    .then(function(resultado)
    {
      if(resultado)
      {
        bcrypt.compare(params.senha, resultado.senha, (err, comparacao) =>
        {
          if(err)
            res.status(500).end(err)
          else if(comparacao)
          {
            delete resultado.dataValues.senha
            req.session.usuario = resultado.dataValues
            res.status(200).end("Login realizado")
          }
          else
            res.status(400).end("Usuário ou senha incorretos")
        })
      }
      else
        res.status(400).end("Usuario ou senha incorretos")
    });
  }
  if(!(req.body.usuario && req.body.senha))
    res.status(400).end("Parâmetros inválidos")
  else if(req.session.usuario)
    delete req.session.usuario
  tratarLogin();
});
router.post('/logout', function(req, res)
{
  req.session.destroy((err) =>
  {
    if(err) res.status(500).end(err)
    else res.status(200).end("Logout realizado com sucesso")
  })
});

router.post('/criaresqueci', (req, res) =>
{
  let params = req.body;
  if(req.session.usuario)
    res.status(403).end("Requisição inválida");
  else if(!params.email)
    res.status(400).end("Parâmetros inválidos");
  else if(!emailer.ValidarEmail(params.email))
    res.status(400).end("Email inválido");
  else
  {
    Usuario.findOne({where: {email : params.email}, attributes : ['id', 'email']}).then((user) =>
    { 
      if(!user)
        res.status(400).end('Nenhuma conta em este endereço de email')
      else
      {
        valores = user.dataValues
        Esqueci.destroy({where : {usuarioID : valores.id}}).then(() =>
        {
          let chave = random.GerarStringAleatoria(60)
          Esqueci.create({chave : chave, usuarioID : valores.id}).then((criado) =>
          {
              let mensagem = getMensagemEsqueci(req, valores.id, criado.dataValues.chave);
    
              emailer.EnviarEmail(valores.email, "Imperium - Recuperação de senha", mensagem, (err) =>
              {
                if(err)
                {
                  res.status(500).end("falha ao enviar email")
                  criado.destroy()
                }
                else
                  res.status(200).end("Requisição criada com sucesso")
              });
          }).catch((err) => res.status(500).end(err));
        });
      }
    });
  }
});

router.post('/reenviaresqueci', (req, res) =>
{
  let params = req.body;
  if(req.session.usuario)
    res.status(403).end("Requisição inválida");
  else if(!params.email)
    res.status(400).end("Parâmetros inválidos");
  else if(!emailer.ValidarEmail(params.email))
    res.status(400).end("Email inválido");
  else
  {
    Usuario.findOne({where: {email : params.email}}).then((user) =>
    {
      if(user)
      {
        Esqueci.findOne({where : {usuarioID : user.dataValues.id}}).then((encontrado) =>
        {
          if(encontrado)
          {
              let mensagem = getMensagemEsqueci(req, user.dataValues.id, encontrado.dataValues.chave);
              emailer.EnviarEmail(user.dataValues.email, "Imperium - Recuperação de senha", mensagem, (err) =>
              {
                if(err)
                {
                  res.status(500).end("falha ao enviar email")
                  criado.destroy();
                }
                else
                  res.status(200).end("Requisição criada com sucesso")
              });
          }
          else
            res.status(400).end("Requisição inválida")
        });
      }
      else
        res.status(400).end('Nenhuma conta em este endereço de email')
    });
  }
});

router.post('/resetar-senha', (req, res) =>
{
  let params = req.body
  if(req.session.usuario)
    res.status(403).end("Requisição inválida")
  else if(!(params.senha && params.confsenha && params.id && params.chave))
    res.status(400).end("Parâmetros inválidos")
  else if(params.senha != params.confsenha)
    res.status(400).end("As senhas não são iguais")
  else
  {
    Esqueci.findOne({where : {usuarioID : params.id, chave : params.chave}}).then((resultado) =>
    {
      if(!resultado)
        res.status(400).end("Requisição inválida")
      else
      {
        bcrypt.hash(params.senha, 10, function(err, hash)
        {
          if(err)
            res.status(500).end(err);
          else
          {
            Usuario.update({senha : hash}, {where : {id : params.id}, limit : 1}).then(() =>
            {
              res.status(200).end("Senha atualizada com sucesso")
              resultado.destroy()
            }).catch((err) => res.status(500).end(err));
          }
        });
      }
    });
  }
});

router.post('/alterar-nick', (req, res) =>
{
  let params = req.body;
  if(!req.session.usuario)
    res.status(403).end("Requisição inválida");
  else if(!params.nick)
    res.status(400).end("Parâmetros inválidos");
  else if(params.nick.toLowerCase() == req.session.usuario.nick.toLowerCase())
    res.status(200).end("Nick alterado com sucesso");
  else
  {
    params.nick = sanitizer.escape(params.nick)
    Usuario.update({nick : params.nick} ,{where : {id : req.session.usuario.id}, limit : 1}).then(() =>
    {
      req.session.usuario.nick = params.nick
      res.status(200).end("Nick alterado com sucesso")
    }).catch(conexao.ValidationError, (err) =>
    {
      let path = err.errors[0].path
      if(err.errors[0].type == "unique violation")
      {
        switch(path)
        {
          case "nick":
            res.status(400).end("Nick "+params.nick + " já cadastrado. Escolha outro.")
            break
          default:
            res.status(500).end(err.errors[0].message)
        }
      }
      else
        res.status(500).end(err.errors[0].message)
    });
  }
});

router.post('/alterar-email', function(req, res)
{
  let params = req.body
  if(!req.session.usuario)
    res.status(403).end("Requisição inválida")
  else if(!(params.email && params.confemail))
    res.status(400).end("Parâmetros inválidos")
  else if(params.email.toLowerCase() == req.session.usuario.email.toLowerCase())
    res.status(200).end("Email alterado com sucesso")
  else if(params.email.toLowerCase() != params.confemail.toLowerCase())
    res.status(400).end("O email e a confirmação do email são diferentes")
  else
  {
    params.email = sanitizer.escape(params.email);
    Usuario.update({email : params.email} ,{where : {id : req.session.usuario.id}, limit : 1}).then(function()
    {
      req.session.usuario.nick = params.nick;
      res.status(200).end("Email alterado com sucesso");
      
      let mensagem = getMensagemTrocaEmail()
      emailer.EnviarEmail(params.email.toLowerCase(), "Imperium - Troca de email", mensagem)
      req.session.usuario.email == params.email
    }).catch(conexao.ValidationError, (err) =>
    {
      let path = err.errors[0].path
      if(err.errors[0].type == "unique violation")
      {
        switch(path)
        {
          case "email":
            res.status(400).end("Email "+params.email + " já cadastrado. Escolha outro.")
            break
          default:
            res.status(500).end(err.errors[0].message)
        }
      }
      else
        res.status(500).end(err.errors[0].message)
    });
  }
});

router.post('/alterar-senha', function(req, res)
{
  let params = req.body
  if(!req.session.usuario)
    res.status(403).end("Requisição inválida")
  else if(!(params.senha && params.confsenha && params.senhaatual))
    res.status(400).end("Parâmetros inválidos")
  else if(params.senha != params.confsenha)
    res.status(400).end("O senha e a confirmação da senha são diferentes")
  else
  {
    Usuario.findOne({where : {id : req.session.usuario.id}, attributes : ['id', 'senha']}).then((user) =>
    {
      if(!user)
        res.status(400).end("Conta não encontrada")
      else
      {
        bcrypt.compare(params.senhaatual, user.dataValues.senha, (err, igual) =>
        {
          if(err)
            res.status(500).end("Erro ao alterar a senha.")
          else if(igual)
          {
            bcrypt.hash(params.senha, 10, (err, hash) =>
            {
              if(err)
                res.status(500).end("Erro ao alterar a senha.")
              else
              {
                user.senha = hash
                user.save().then(() =>
                {
                  emailer.EnviarEmail(req.session.usuario.email, "Imperium - Troca de senha", getMensagemTrocaSenha())
                  res.status(200).end("Senha alterada com sucesso")
                }).catch(() => res.status(500).end("Erro ao alterar a senha."))
              }
            });
          }
          else
            res.status(400).end('A senha atual digitada é inválida');
        });
      }
    })
  }
});

router.post('enviar-ativacao', function(req, res)
{
  if(!req.session.usuario)
    res.status(403).end("Requisição inválida")
  else if(req.session.ativo == true)
    res.status(400).end("A conta já esta ativada")
  else 
  {
    Usuario.findOne({where : {id : req.session.usuario.id}, attributes : ['id', 'ativo', 'chave_ativacao']}).then((user) =>
    {
      if(user.ativo)
      {
        req.session.usuario.ativo == true
        res.status(400).end("A conta já esta ativada")
      }
      else
      {
        EnviarEmailAtivacao(req, user.id, user.chave_ativacao, req.session.usuario.email)
        res.status(200).end("Email de ativação enviado")
      }
    });
  }
});

router.post('/enviar-ativacao', function(req, res)
{
  if(!req.session.usuario)
  {
    res.status(403).end("Requisição inválida");
  }
  else if(req.session.usuario.ativo)
    res.status(400).end("Conta já está ativada")
  else
  {
    EnviarEmailAtivacao(req, req.session.usuario.id, req.session.usuario.chave_ativacao, req.session.usuario.email)
    res.status(200).end("Email enviado")
  }
});

const rankingResultadosPorPagina = Number(process.env.RANKING_MAX_RESULTADOS);
router.get('/getRankings', (req, res) => {
/**
 * @type {{tipo : string, pagina? : number}}
 */
  let params = req.query
  if(!req.session.usuario)
    res.status(403).end("Operação inválida")
  else if(!params.tipo)
    res.status(400).end("É necessário informar uma página e tipo de pontos válidos")
  else
  {
    if(params.pagina)
    {
      ranking.GetRankings((params.pagina - 1)  * rankingResultadosPorPagina, rankingResultadosPorPagina, params.tipo).then((rankUsuarios) =>
      {
        Usuario.count({}).then(contagem => {
          let retorno = {usuarios: rankUsuarios, pagina : params.pagina, total: contagem, resultadosPorPagina : rankingResultadosPorPagina}
          res.status(200).json(retorno)
        });
        
      });
    }
    else
    {
      ranking.GetRankingUsuario(req.session.usuario.id, params.tipo).then(rank =>
      {
        let pagina = Math.ceil(rank / rankingResultadosPorPagina)
        ranking.GetRankings((pagina - 1)  * rankingResultadosPorPagina, rankingResultadosPorPagina, params.tipo).then((/***@type {Array.<UsuarioRank>} */rankUsuarios) =>
        {
          Usuario.count({}).then((contagem) => {
            let retorno = {usuarios: rankUsuarios, total: contagem, pagina : pagina, resultadosPorPagina : rankingResultadosPorPagina}
            res.status(200).json(retorno)
          }); 
        });
      });
    }  
  }
});

module.exports = router;
