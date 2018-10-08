const $ = require('jquery')
const utils = require('./../../../generic/modules/utils')


/**
 * 
 * @param {number} destinatario O id do destinatário
 * @param {string} titulo O titulo auxiliar. Recomendado que seja o nome do jogador
 * @description Abre o modal para envio de mensagem privada
 */
function AbrirModalEnviarMensagemPrivada(destinatario, titulo) {
	$("#modal-enviar-mensagem-privada .modal-title span").text(titulo);
	$("#form-enviar-mensagem-privada input[name='destinatario']").val(destinatario);
	$("#modal-enviar-mensagem-privada").modal('show');
}


/**
 * 
 * @param {number} destinatario O id do destinatário
 * @param {string} titulo O titulo auxiliar. Recomendado que seja o nome do jogador
 * @description Abre o modal para envio de mensagem privada
 */
function AbrirModalEnviarConvite(destinatario, titulo) {
	$("#modal-enviar-convite .modal-title span").text(titulo);
	$("#form-enviar-convite input[name='destinatario']").val(destinatario);
	$("#modal-enviar-convite").modal('show');
}

$(document).ready(function () {


	$("#form-enviar-mensagem-privada").on('submit', function () {
		var params = utils.FormToAssocArray($(this));
		var btn = $(this).find("button");
		$.ajax({
			url: 'comunicacao/enviar-mensagem-privada',
			method: 'POST',
			data: params,
			beforeSend: function () {
				btn.text("Enviando...")
			},
			success: function () {
				utils.GerarNotificacao("Mensagem enviada com sucesso", 'success')
			},
			error: function (err) {
				utils.GerarNotificacao(err.responseText, 'danger')
			},
			complete: function () {
				btn.text("Enviar Mensagem")
			}
		})
	})

	$("#form-enviar-convite").on('submit', function () {
		var params = utils.FormToAssocArray($(this));
		var btn = $(this).find("button");
		$.ajax({
			url: 'alianca/enviar-convite',
			method: 'POST',
			data: params,
			beforeSend: function () {
				btn.text("Enviando...")
			},
			success: function () {
				utils.GerarNotificacao("Convite com sucesso", 'success')
			},
			error: function (err) {
				utils.GerarNotificacao(err.responseText, 'danger')
			},
			complete: function () {
				btn.text("Enviar Convite")
			}
		})
	})
})

module.exports = {
	AbrirModalEnviarMensagemPrivada: AbrirModalEnviarMensagemPrivada,
	AbrirModalEnviarConvite: AbrirModalEnviarConvite
}