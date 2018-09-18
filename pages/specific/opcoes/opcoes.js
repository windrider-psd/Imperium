const $ = require('jquery')
let utils = require('./../../general/userdata/utils')
$(document).ready(function()
{
    $("#email-atual").val(userdata.session.email);
    $("#nick-atual").val(userdata.session.nick);
    $("#btn-enviar-ativo").on('click', function()
    {
      var btn = $(this);
      $.ajax({
        method : "POST",
        url : "usuario/enviar-ativacao",
        beforeSend : function()
        {
          btn.html("Enviando...");
        },
        success : function()
        {
          utils.GerarNotificacao("Mensagem enviada para " + uEmail + ".", "success");
        },
        error : function(mensagem)
        {
          utils.GerarNotificacao(mensagem.responseText, "danger");
        },
        complete : function()
        {
          btn.html("Reenviar email de ativação");
        }
      });
  });
  $("#form-alterar-nick").on('submit', function()
  {
    var info = utils.FormToAssocArray($(this));
    var btn = $(this).find("button[type='submit']");
    $.ajax({
      method : "POST",
      url : "usuario/alterar-nick",
      data : info,
      beforeSend : function()
      {
        btn.html("Alterando...")
      },
      success : function()
      {
        utils.GerarNotificacao("Nick alterado com sucesso", "success");
        userdata.session.nick = info.nick;
        $("#nav-nick").text(info.nick);
      },
      error : function(mensagem)
      {
        utils.GerarNotificacao(mensagem.responseText, "danger");
      },
      complete : function()
      {
        btn.html("Alterar");
      }
    })
  });
  $("#form-alterar-email").on('submit', function()
  {
    var info = utils.FormToAssocArray($(this));
    var btn = $(this).find("button[type='submit']");
    $.ajax({
      method : "POST",
      url : "usuario/alterar-email",
      data : info,
      beforeSend : function()
      {
        btn.html("Alterando...")
      },
      success : function()
      {
        utils.GerarNotificacao("Email alterado com sucesso", "success");
        userdata.session.email = info.email;
      },
      error : function(mensagem)
      {
        utils.GerarNotificacao(mensagem.responseText, "danger");
      },
      complete : function()
      {
        btn.html("Alterar");
      }
    })
  });
  $("#form-alterar-senha").on('submit', function()
  {
    var info = utils.FormToAssocArray($(this));
    var btn = $(this).find("button[type='submit']");
    $.ajax({
      method : "POST",
      url : "usuario/alterar-senha",
      data : info,
      beforeSend : function()
      {
        btn.html("Alterando...")
      },
      success : function()
      {
        utils.GerarNotificacao("Senha alterada com sucesso", "success");
        userdata.session.ativo = true;
      },
      error : function(erro)
      {
        utils.GerarNotificacao(erro.responseText, "danger");
      },
      complete : function()
      {
        btn.html("Alterar");
      }
    })
  });
})