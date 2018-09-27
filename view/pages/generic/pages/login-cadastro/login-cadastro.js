let infoEsqueci;
const $ = require('jquery')
const utils = require('./../../modules/utils')
$(document).ready(function ()
{
	$("#esqueci-link").on('click', function ()
	{
		$("#conteudo-enviar-esqueci").show();
		$("#pos-conteudo-enviar-esqueci").hide();
		$("#modalEsqueci").modal('show');
	});

	$("#btn-email-esqueci").on('click', function ()
	{
		$("#conteudo-enviar-esqueci").show();
		$("#pos-conteudo-enviar-esqueci").hide();
	});
	$("#btn-reenviar-esqueci").on('click', function ()
	{
		var btn = $(this);
		$.ajax(
		{
			method: "POST",
			url: "usuario/reenviaresqueci",
			data: infoEsqueci,
			beforeSend: function ()
			{
				btn.html("Enviando...");
			},
			success: function ()
			{
				$("#conteudo-enviar-esqueci").hide();
				$("#pos-conteudo-enviar-esqueci").show();
				utils.GerarNotificacao("Mensagem enviada com sucesso", "success");
			},
			error: function (mensagem)
			{
				utils.GerarNotificacao(mensagem.responseText, "danger");
			},
			complete: function ()
			{
				btn.html("Reenviar email");
			}
		})
	});

	$("#form-enviar-esqueci").on('submit', function ()
	{
		infoEsqueci = utils.FormToAssocArray($(this));
		var btn = $(this).find("button[type='submit']");
		$.ajax(
		{
			method: "POST",
			url: "usuario/criaresqueci",
			data: infoEsqueci,
			beforeSend: function ()
			{
				btn.html("Enviando...")
			},
			success: function ()
			{
				$("#conteudo-enviar-esqueci").hide();
				$("#pos-conteudo-enviar-esqueci").show();
			},
			error: function (mensagem)
			{
				utils.GerarNotificacao(mensagem.responseText, "danger");
			},
			complete: function ()
			{
				btn.html("Enviar");
			}
		})
	});

	$("#form-login").on('submit', function ()
	{
		var info = utils.FormToAssocArray($(this));
		$.ajax(
		{
			method: "POST",
			url: "usuario/login",
			data: info,

			success: function ()
			{
				window.location.href = "/";
			},
			error: function (mensagem)
			{
				utils.GerarNotificacao(mensagem.responseText, "danger");
			}
		})
	});
	$("#form-cadastro").on('submit', function ()
	{
		var info = utils.FormToAssocArray($(this));
		$.ajax(
		{
			method: "POST",
			url: "usuario/cadastrar",
			data: info,

			success: function ()
			{
				utils.GerarNotificacao("Conta criada com sucesso", "success");
				window.location.href = "/"
			},
			error: function (mensagem)
			{
				utils.GerarNotificacao(mensagem.responseText, "danger");
			}
		})
	});
	$("#nav-tab-cadastro").on('click', function ()
	{
		$("#nav-tab-login").removeClass('active')
		$(this).addClass('active')
		$("#form-login").addClass('hidden')
		$("#form-cadastro").removeClass('hidden')
	})
	$("#nav-tab-login").on('click', function ()
	{
		$("#nav-tab-cadastro").removeClass('active')
		$(this).addClass('active')
		$("#form-cadastro").addClass('hidden')
		$("#form-login").removeClass('hidden')
	})
})