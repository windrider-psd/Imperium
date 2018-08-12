/**
 * @typedef UsuarioRank
 * @property {number} id
 * @property {number} rank
 * @property {number} desempenho Ainda não está implementado
 * @property {string} nome
 * @property {number} pontos
 * @property {Object} alianca
 * @property {number} alianca.id
 * @property {string} alianca.nome
*/

/**
 * @typedef RetornoPaginacao
 * @property {Array.<UsuarioRank>} usuarios
 * @property {number} total
 * @property {number} rankAtual
 */


CarregarTipo(Math.ceil(userdata.rank / resultadosPorPagina), 'pontosTotal', false);

var total;
var tipoAtual;

/**
 * 
 * @param {number} pagina A página que será exibida
 * @param {string} tipo O tipo de pontuação 
 * @param {boolean} [usuarioAtual=false] 
 */
function CarregarTipo(pagina, tipo, usuarioAtual = false)
{
    $.ajax({
        url: 'usuario/getRankings',
        data : {pagina : pagina, tipo : tipo, usuarioAtual : usuarioAtual},
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
                    htmlString += "<td><a href = 'alianca?id="+usuarios[i].alianca.id+"'>"+usuarios[i].alianca.nome+"</a></td>"
                }
                else
                {
                    htmlString += "<td></td>";
                }
                htmlString += "<td><button class = 'btn btn-primary btn-sm btn-enviar-mensagem'><i class = 'fa fa-comment'></i></button></td>"
                htmlString += "<td>"+usuarios[i].pontos.toFixed(2)+"</td></tr>"
            }
            $("#conteudo-ranking").html(htmlString);
            total = resultado.total;
            tipoAtual = tipo;
            if(usuarioAtual)
                GerarHTMLPaginacao(resultado.total, Math.ceil((pagina * resultado.rankAtual) / resultadosPorPagina) - 1);
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
}

$(".paginacao").on('click', ".paginacao_pagina", function()
{
    var btnAtual = $(".paginacao_pagina.active");
    var paginaAtual = btnAtual.data('idpagina');
    var proximaPagina = $(this).data('idpagina');
    if(proximaPagina < 0)
        return;
    else if(proximaPagina + 1 > total)
        return;

    $(this).addClass("active");
    console.log($(this).html())
    btnAtual.removeClass('active');

    CarregarTipo(proximaPagina + 1,tipoAtual, false);
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

    $(".paginacao_pagina[data-idpagina='"+proxima+"']").addClass("active");
    btnAtual.removeClass('active');

    CarregarTipo(proximaPagina + 1,tipoAtual, false);

}

$(".btn-pontos").on('click', function()
{
    var atual = $(".btn.pontos.active");
    if(atual.is($(this)))
    {
        return;
    }
    
    CarregarTipo(undefined, $(this).data('tipo'), true);
    $(this).addClass("active");
});

