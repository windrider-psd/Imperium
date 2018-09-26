/**
 * @typedef UsuarioRank
 * @property {number} id
 * @property {number} rank
 * @property {number} desempenho Ainda não está implementado
 * @property {string} nome
 * @property {number} pontos
 * @property {Object} [alianca]
 * @property {number} alianca.id
 * @property {string} alianca.nome
 * @property {string} alianca.tag
 */

/**
 * @typedef RetornoPaginacao
 * @property {Array.<UsuarioRank>} usuarios
 * @property {number} total
 * @property {number} [pagina]
 * @property {number} resultadosPorPagina
 */

let tipoAtual;
const $ = require('jquery')
const pagination = require('pagination')
const utils = require('./../../general/userdata/utils')
const observer = require('./../../general/observer')
let paginaAtual
let mensagens = require('./../../general/modal-mensagens')

observer.Observar('userdata-ready',  function ()
{
	const isLider = (userdata.alianca != null) ? userdata.session.id == userdata.alianca.lider : false
	CarregarTipo(undefined, 'pontosTotal', true);

	function CarregarTipo(pagina, tipo)
	{

		$.ajax(
		{
			url: 'usuario/getRankings',
			data:
			{
				pagina: pagina,
				tipo: tipo
			},
			method: 'GET',
			dataType: 'JSON',
			success: function ( /**@type {RetornoPaginacao} */ resultado)
			{
				var htmlString = ""
				var usuarios = resultado.usuarios
				for (var i = 0; i < usuarios.length; i++)
				{
					
					htmlString += "<tr "
					if (usuarios[i].id == userdata.session.id)
					{
						htmlString += "class = 'info'";
					}

					htmlString += "><td>" + usuarios[i].rank + "</td><td>" + usuarios[i].nome + "</td>"
					if (typeof (usuarios[i].alianca) !== 'undefined')
					{
						var link;
						if (userdata.alianca != null && userdata.alianca.id == usuarios[i].alianca.id)
							link = "alianca"
						else
							link = "paginaExterna?id=" + usuarios[i].alianca.id
						htmlString += "<td><a href = '" + link + "' title = '" + usuarios[i].alianca.nome + "'>" + usuarios[i].alianca.tag + "</a></td>"
					}
					else
						htmlString += "<td></td>"

					if (usuarios[i].id != userdata.session.id)
					{
						htmlString += "<td><button data-destinatario = '" + usuarios[i].id + "' data-nome = '" + usuarios[i].nome + "' class = 'btn btn-primary btn-sm btn-enviar-mensagem' title = 'Enviar mensagem'>" +
							"<i class = 'fa fa-comment'></i></button>"
						if (typeof (usuarios[i].alianca) === 'undefined' && (isLider || (userdata.alianca != null && userdata.alianca.rank != null && userdata.aliaca.rank.convidar == true)))
						{
							htmlString += "<button data-destinatario = '" + usuarios[i].id + "' data-nome = '" + usuarios[i].nome + "' class = 'btn btn-primary btn-sm btn-enviar-convite' title = 'Enviar convite de aliança'>" +
								"<i class = 'fa fa-envelope-square'></i></button>"
						}
						htmlString += "</td>"
					}

					else
						htmlString += "<td></td>"

					htmlString += "<td>" + usuarios[i].pontos.toFixed(2) + "</td></tr>"
				}
				$("#conteudo-ranking").html(htmlString);
				let total = resultado.total
				let resultadosPorPagina = resultado.resultadosPorPagina
				tipoAtual = tipo;
                paginaAtual = resultado.pagina;
				let boostrapPaginator = new pagination.TemplatePaginator(
				{
					prelink: '/',
					current: paginaAtual,
					rowsPerPage: resultadosPorPagina,
					totalResult: total,
					slashSeparator: true,
					template: function (result)
					{
						var i, len;
						var html = '<div><ul class="pagination">';
						if (result.pageCount < 2)
						{
							html += '</ul></div>';
							return html;
						}
						if (result.previous)
						{
							html += '<li><a href="#" class = "paginacao-anterior">Anterior</a></li>';
						}
						if (result.range.length)
						{
							for (i = 0, len = result.range.length; i < len; i++)
							{
								if (result.range[i] === result.current)
								{
									html += '<li class="active"><a href="#" data-pagina="' + result.range[i] + '" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
								}
								else
								{
									html += '<li><a href="#" data-pagina="' + result.range[i] + '" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
								}
							}
						}
						if (result.next)
						{
							html += '<li><a href="#" class="paginacao-proximo">Próximo</a></li>';
						}
						html += '</ul></div>';
						return html;
					}
				});
				$(".paginacao").html(boostrapPaginator.render())
			}
		})
	}


	
    $(".paginacao").on('click', '.paginacao-pagina', function(){
        let pagina = $(this).data('pagina')
        CarregarTipo(pagina, tipoAtual)
    })
    $(".paginacao").on('click', '.paginacao-anterior', function(){
        paginaAtual--
        CarregarTipo(paginaAtual, tipoAtual)
    })
    $(".paginacao").on('click', '.paginacao-proximo', function(){
        paginaAtual++
        CarregarTipo(paginaAtual, tipoAtual)
	})
	

	$(".btn-pontos").on('click', function ()
	{
		var atual = $(".btn-pontos.active");
		if (atual.is($(this)))
		{
			return;
		}
		atual.removeClass('active');

		CarregarTipo(undefined, $(this).data('tipo'), true);
		$(this).addClass("active");
	});


	$("#conteudo-ranking").on('click', ".btn-enviar-mensagem", function ()
	{
		mensagens.AbrirModalEnviarMensagemPrivada($(this).data('destinatario'), $(this).data('nome'));
	});

	$("#conteudo-ranking").on('click', ".btn-enviar-convite", function ()
	{
		mensagens.AbrirModalEnviarConvite($(this).data('destinatario'), $(this).data('nome'));
	});
})
$(document).ready(function(){
	$("main").addClass('imperium-scrollbar')
})
