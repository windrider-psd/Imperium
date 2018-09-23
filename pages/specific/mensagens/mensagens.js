/**
 * @typedef MensagemObject
 * @property {string} assunto
 * @property {Date} criacao
 * @property {number} destinatario
 * @property {number} remetente
 * @property {string} nick O nick do remetente se inbox. O nick do destinatario se outbox
 * @property {string} mensagem
 * @property {boolean} [visualizada] Se a mensagem foi visualizada. Undefined se outbox
 * @property {number} id
 */

const periodoPaginas = 10;
var inboxbool;
var total;
/**
 * @type {Array.<MensagemObject>}
 */
var boxAux;
const $ = require('jquery')
const utils = require('./../../general/userdata/utils')
const observer = require('./../../general/observer')
let pagination = require('pagination')
let atual;
$(document).ready(function () {
	getInbox(1, function (inbox) {
		setInboxContent(inbox.mensagens, inbox.total)
	});


	$("#tab-btn-out").on('click', function () {
		getOutbox(1, function (outbox) {
			setOutboxContent(outbox.mensagens, outbox.total)
		});
	})

	$("#tab-btn-in").on('click', function () {
		getInbox(1, function (inbox) {
			setInboxContent(inbox.mensagens, inbox.total)
		});
	})

	/**
	 * 
	 * @param {number} pagina O número da pagina que será buscada
	 * @param {Function} callback callback(inbox : MensagemObject) 
	 */
	function getInbox(pagina, callback) {
		$.ajax({
			url: 'comunicacao/getInbox',
			method: "GET",
			data: {
				pagina: pagina
			},
			success: function ( /** @type {{mensagens : Array.<MensagemObject>, total : number}} */ inbox) {
				total = inbox.total
				inboxbool = true;
                boxAux = inbox.mensagens
                atual = pagina
                let resultadosPorPagina = inbox.resultadosPorPagina
                let contentString = '<div class="table-responsive"> <table class="table table-striped table-bordered imperium-table imperium-table-background"> <thead> <tr> <th>Assunto</th> <th>De</th><th>Ações</th><th>Data</th></tr></thead> <tbody id="box-tbody">'
                contentString += getConteudoTabela(inbox.mensagens);
                let boostrapPaginator = new pagination.TemplatePaginator({
                    prelink:'/', current: pagina, rowsPerPage: resultadosPorPagina,
                    totalResult: total, slashSeparator: true,
                    template: function(result) {
                        var i, len;
                        var html = '<div><ul class="pagination">';
                        if(result.pageCount < 2) {
                            html += '</ul></div>';
                            return html;
                        }
                        if(result.previous) {
                            html += '<li><a href="#" class = "paginacao-anterior">Anterior</a></li>';
                        }
                        if(result.range.length) {
                            for( i = 0, len = result.range.length; i < len; i++) {
                                if(result.range[i] === result.current) {
                                    html += '<li class="active"><a href="#" data-pagina="'+result.range[i]+'" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
                                } else {
                                    html += '<li><a href="#" data-pagina="'+result.range[i]+'" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
                                }
                            }
                        }
                        if(result.next) {
                            html += '<li><a href="#" class="paginacao-proximo">Próximo</a></li>';
                        }
                        html += '</ul></div>';
                        return html;
                    }
                });

                $(".tab-content").html(contentString + boostrapPaginator.render() + "</div>");

                $("#tab-btn-in").addClass('active');
                $("#tab-btn-out").removeClass('active');

			},
			error: function (err) {
				utils.GerarNotificacao(err.responseText, 'danger');
			}
		})
	}

	function getOutbox(pagina, callback) {
		$.ajax({
			url: 'comunicacao/getOutbox',
			method: "GET",
			data: {
				pagina: pagina
			},
			success: function ( /** @type {{mensagens : Array.<MensagemObject>, total : number}} */ outbox) {
				total = outbox.total
				inboxbool = false;
                boxAux = outbox.mensagens
                atual = pagina
                let resultadosPorPagina = outbox.resultadosPorPagina
                let contentString = '<div class="table-responsive"> <table class="table table-striped table-bordered imperium-table imperium-table-background"> <thead> <tr> <th>Assunto</th> <th>Para</th><th>Ações</th><th>Data</th></tr></thead><tbody id="box-tbody">'
                contentString += getConteudoTabela(outbox.mensagens);

                let boostrapPaginator = new pagination.TemplatePaginator({
                    prelink:'/', current: pagina, rowsPerPage: resultadosPorPagina,
                    totalResult: total, slashSeparator: true,
                    template: function(result) {
                        var i, len;
                        var html = '<div><ul class="pagination">';
                        if(result.pageCount < 2) {
                            html += '</ul></div>';
                            return html;
                        }
                        if(result.previous) {
                            html += '<li><a href="#" class = "paginacao-anterior">Anterior</a></li>';
                        }
                        if(result.range.length) {
                            for( i = 0, len = result.range.length; i < len; i++) {
                                if(result.range[i] === result.current) {
                                    html += '<li class="active"><a href="#" data-pagina="'+result.range[i]+'" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
                                } else {
                                    html += '<li><a href="#" data-pagina="'+result.range[i]+'" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
                                }
                            }
                        }
                        if(result.next) {
                            html += '<li><a href="#" class="paginacao-proximo">Próximo</a></li>';
                        }
                        html += '</ul></div>';
                        return html;
                    }
                });


                $(".tab-content").html(contentString + boostrapPaginator.render() + "</div>");
                $("#tab-btn-out").addClass('active');
                $("#tab-btn-in").removeClass('active');
                    
                
			},
			error: function (err) {
				utils.GerarNotificao(err.responseText, 'danger');
			}
		})
	}

	/**
	 * 
	 * @param {Array.<MensagemObject>} inbox 
	 * @description Gera a html da lista de mensagens de inbox
	 * @returns {string}
	 */
	function getConteudoTabela(inbox) {
		var htmlString = '';
		for (var i = 0; i < inbox.length; i++) {
			htmlString += "<tr>";
			if (inbox[i].visualizada === false)
				htmlString += "<td><a class = 'link c-pointer mensagem-link' data-id = '" + inbox[i].id + "' data-userid = '" + inbox[i].remetente + "' data-nome = '" + inbox[i].nick + "' data-visualizada = '0'><b><u>" + inbox[i].assunto + "</u></b></a></td>"
			else
				htmlString += "<td><a class = 'link c-pointer mensagem-link' data-id = '" + inbox[i].id + "' data-userid = '" + inbox[i].remetente + "' data-nome = '" + inbox[i].nick + "' data-visualizada = '1'>" + inbox[i].assunto + "</a></td>"

			htmlString += '<td>' + inbox[i].nick + '</td><td><button type = "button" data-id = "' + inbox[i].id + '" class = "btn btn-danger btn-sm btn-apagar-mensagem"><i class = "fa fa-times"></i></button></td><td>' + utils.FormatarDate(new Date(inbox[i].criacao), '/') + '</td></tr>'
		}
        htmlString += "</tbody></table>"
        
		return htmlString
	}




	$(".tab-content").on('click', ".paginacao-pagina", function () {

		let proximaPagina = $(this).data('pagina');
		if (inboxbool === true) {
			getInbox(proximaPagina)
		} else {
			getOutbox(proximaPagina)
		}

	});

    $(".tab-content").on('click', '.paginacao-anterior', function(){
        atual--
        if (inboxbool === true) {
			getInbox(atual)
		} else {
			getOutbox(atual)
		}
    })
    $(".tab-content").on('click', '.paginacao-proximo', function(){
        atual++
        if (inboxbool === true) {
			getInbox(atual)
		} else {
			getOutbox(atual)
		}
    })


	/**
	 * @param {number} idmensagem O id da mensagem
	 * @description Coloca uma mensagem como estado visualizada
	 */
	function setMensagemVisualizada(idmensagem) {
		$.ajax({
			url: 'comunicacao/setInboxVisualizada',
			method: 'POST',
			data: {
				id: idmensagem
			}
		})
	}

	$(".tab-content").on('click', '.mensagem-link', function () {
		if (inboxbool == true) {
			if ($(this).data('visualizada') == '0') {
				setMensagemVisualizada($(this).data('id'))
				var texto = $(this).text()
				$(this).find("b").remove()
				$(this).text(texto)
				$(this).data('visualizada', '1')
			}
		}

		var JModal = $("#modal-visualizar-mensagem-privada");
		var mensagem;
		for (var i = 0; i < boxAux.length; i++) {
			if (boxAux[i].id == Number($(this).data('id'))) {
				mensagem = boxAux[i];
				break
			}
		}
		JModal.find(".modal-title").text(mensagem.assunto);
		JModal.find(".nome").text(mensagem.nick);
		JModal.find(".conteudo").html(mensagem.mensagem.replace(/(?:\r\n|\r|\n)/g, '<br />'));
		JModal.find(".destinatario").val((inboxbool) ? mensagem.remetente : mensagem.destinatario);
		JModal.find(".assunto").val(mensagem.assunto);
		JModal.modal("show");
	})

	$("#modal-visualizar-mensagem-privada form").on("submit", function () {
		var params = utils.FormToAssocArray($(this));
		var btn = $(this).find("button");
		$.ajax({
			url: 'comunicacao/enviar-mensagem-privada',
			method: 'POST',
			data: params,
			beforeSend: function () {
				btn.text("Respondendo...")
			},
			success: function () {
				utils.GerarNotificacao("Resposta enviada com sucesso", 'success')
			},
			error: function (err) {
				utils.GerarNotificacao(err.responseText, 'danger')
			},
			complete: function () {
				btn.text("Responder Mensagem")
			}
		})
	})

	$(".tab-content").on('click', '.btn-apagar-mensagem', function () {
		var id = $(this).data('id');
		var linha = $(this).parent().parent();
		var excluir = function () {
			$.ajax({
				url: 'comunicacao/apagar-mensagem-privada',
				method: 'POST',
				data: {
					idmensagem: id
				},
				success: function () {
					utils.GerarNotificacao("Mensagem excluida com sucesso", 'success')
					linha.remove();
				},
				error: function (err) {
					utils.GerarNotificacao(err.responseText, 'danger')
				}
			})
		}

		utils.GerarConfirmacao("Tens certeza que desejas excluir esta mensagem?", excluir);
	})
})