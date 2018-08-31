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
 */


CarregarTipo(undefined, 'pontosTotal', true);

var total;
var tipoAtual;
const periodoPaginas = 10;
const isLider = (userdata.alianca != null) ? userdata.session.id == userdata.alianca.lider : false
/**
 * 
 * @param {number} pagina A página que será exibida
 * @param {string} tipo O tipo de pontuação 
 * @param {boolean} [gerarPaginacao=false] 
 */
function CarregarTipo(pagina, tipo)
{
    $.ajax({
        url: 'usuario/getRankings',
        data : {pagina : pagina, tipo : tipo},
        method : 'GET',
        dataType: 'JSON',
        success : function(/**@type {RetornoPaginacao} */ resultado)
        {
            var htmlString = ""
            var usuarios = resultado.usuarios
            for(var i = 0; i < usuarios.length; i++)
            {
                htmlString += "<tr "
                if(usuarios[i].id == userdata.session.id)
                {
                    htmlString += "class = 'info'";
                }

                htmlString += "><td>"+usuarios[i].rank+"</td><td>"+usuarios[i].desempenho+"</td><td>"+usuarios[i].nome+"</td>"
                if(typeof(usuarios[i].alianca) !== 'undefined')
                {
                    var link;
                    if(userdata.alianca != null && userdata.alianca.id == usuarios[i].alianca.id)
                        link = "alianca"
                    else
                        link = "paginaExterna?id="+usuarios[i].alianca.id
                    htmlString += "<td><a href = '"+link+"' title = '"+usuarios[i].alianca.nome+"'>"+usuarios[i].alianca.tag+"</a></td>"
                }
                else
                    htmlString += "<td></td>"

                if(usuarios[i].id != userdata.session.id)
                {
                    htmlString += "<td><button data-destinatario = '"+usuarios[i].id+"' data-nome = '"+usuarios[i].nome+"' class = 'btn btn-primary btn-sm btn-enviar-mensagem'>"
                        + "<i class = 'fa fa-comment'></i></button>"
                    if(typeof(usuarios[i].alianca) === 'undefined' && (isLider || (userdata.alianca != null && userdata.alianca.rank != null && userdata.aliaca.rank.convidar == true)))
                    {
                        htmlString += "<button data-destinatario = '"+usuarios[i].id+"' data-nome = '"+usuarios[i].nome+"' class = 'btn btn-primary btn-sm btn-enviar-convite'>"
                            + "<i class = 'fa fa-envelope-square'></i></button>"
                    }
                    htmlString += "</td>"
                }
                  
                else
                    htmlString += "<td></td>"
                
                htmlString += "<td>"+usuarios[i].pontos.toFixed(2)+"</td></tr>"
            }
            $("#conteudo-ranking").html(htmlString);
            total = resultado.total;
            tipoAtual = tipo;
            if(typeof(pagina) === 'undefined')
                GerarHTMLPaginacao(resultado.total, resultado.pagina - 1);
        }
    })  
}

function VerificarProximo(paginaAtual, totaldePaginas)
{
    if(paginaAtual >= totaldePaginas - 1)
    {
        $("#paginacao-proximo").addClass("hidden");
    }
    else
    {
        $("#paginacao-proximo").removeClass("hidden");
    }

    if(paginaAtual <= 0)
    {
        $("#paginacao-anterior").addClass("hidden");
    }
    else
    {
        $("#paginacao-anterior").removeClass("hidden");
    }
}

function GerarHTMLPaginacao(totalUsuarios, ativoIndex)
{
    if(totalUsuarios > resultadosPorPagina)
    {
        var paginacaoString = '<li><a rel="next" id = "paginacao-anterior" onclick="AvancarPagina(-1)" style = "cursor:pointer">Anterior</a></li>';
        var totalPaginas = Math.ceil(totalUsuarios / resultadosPorPagina);
        totaldePaginas = totalPaginas;
        for(var i = 0; i < totalPaginas; i++)
        {
            paginacaoString += '<li data-idpagina="'+i+'" class = "c-pointer paginacao_pagina';
            if(i == ativoIndex)
            {
                paginacaoString += ' active';
            }
            paginacaoString += '"><a href= "#">'+(i + 1)+'</a></li>'; 
        }
        paginacaoString += '<li><a rel="next" id = "paginacao-proximo" onclick="AvancarPagina(1)" style = "cursor:pointer">Próxima</a></li>';
        paginacaoString += '<form style = "display:inline" id = "form-paginacao-goto" onsubmit="return false" class = "form-inline"><div class="form-group"><input type="number" id = "paginacao_goto" class = "form-control"/></div><button class = "btn btn-primary" type="submit" id="changePage">Ir</button></form>';
        $(".paginacao").html(paginacaoString);
        VerificarProximo(ativoIndex, Math.ceil(totalUsuarios / resultadosPorPagina))
        EsconderPaginacao(ativoIndex + 1, Math.ceil(total / resultadosPorPagina));
    }
    
}

$(".paginacao").on('click', ".paginacao_pagina", function()
{
    var btnAtual = $(".paginacao_pagina.active");
    var proximaPagina = $(this).data('idpagina');
    if(proximaPagina < 0)
        return;
    else if(proximaPagina + 1 > total)
        return;

    $(this).addClass("active");
    btnAtual.removeClass('active');

    CarregarTipo(proximaPagina + 1,tipoAtual, false);
    VerificarProximo(proximaPagina, Math.ceil(total / resultadosPorPagina))
    EsconderPaginacao(proximaPagina + 1, Math.ceil(total / resultadosPorPagina));
});

function AvancarPagina(proxima)
{
    var btnAtual = $(".paginacao_pagina.active");
    var paginaAtual = btnAtual.data('idpagina');
    var proximaPagina = paginaAtual += proxima;
    if(proximaPagina < 0)
        return;
    else if(proximaPagina + 1 > total)
        return;

    $(".paginacao_pagina[data-idpagina='"+proximaPagina+"']").addClass("active");
    btnAtual.removeClass('active');

    CarregarTipo(proximaPagina + 1,tipoAtual, false);
    VerificarProximo(proximaPagina, Math.ceil(total / resultadosPorPagina))
    EsconderPaginacao(proximaPagina + 1, Math.ceil(total / resultadosPorPagina));
}

/**
 * 
 * @param {number} paginaAtual 
 * @param {number} totaldePaginas 
 * @description Insere os ... entre paginas
 */
function EsconderPaginacao(paginaAtual, totaldePaginas)
{
    $(".paginacao_dots").remove();
    $(".paginacao_pagina").removeClass("hidden");
    var j = paginaAtual + periodoPaginas;
    if(j < totaldePaginas + 1)
    {
        $('<li class="disabled paginacao_dots"><a>...</a></li>').insertBefore($(".paginacao_pagina").eq(j));
       
    }
    for(;j < totaldePaginas; j++)
    {
        $(".paginacao_pagina").eq(j - 1).addClass("hidden");
    }

    var j = paginaAtual - periodoPaginas - 1;
    if(j > 0 )
    {
        $('<li class="disabled paginacao_dots"><a>...</a></li>').insertBefore($(".paginacao_pagina").eq(j));
    }
    for(;j > 0; j--)
    {
        $(".paginacao_pagina").eq(j).addClass("hidden");
    }
}

$(".btn-pontos").on('click', function()
{
    var atual = $(".btn-pontos.active");
    if(atual.is($(this)))
    {
        return;
    }
    atual.removeClass('active');
    
    CarregarTipo(undefined, $(this).data('tipo'), true);
    $(this).addClass("active");
});

$(".paginacao").on('submit', '#form-paginacao-goto', function()
{
    let pagina = Number($("#paginacao_goto").val()).toFixed(0);
    CarregarTipo(pagina, tipoAtual);
    GerarHTMLPaginacao(total, pagina - 1);
});

$("#conteudo-ranking").on('click', ".btn-enviar-mensagem", function() {
    AbrirModalEnviarMensagemPrivada($(this).data('destinatario'), $(this).data('nome'));
});

$("#conteudo-ranking").on('click', ".btn-enviar-convite", function() {
    AbrirModalEnviarConvite($(this).data('destinatario'), $(this).data('nome'));
});