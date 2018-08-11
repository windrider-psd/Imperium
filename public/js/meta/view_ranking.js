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

CarregarTipo(Math.ceil(userdata.rank / 30), 'pontosTotal');

/**
 * 
 * @param {number} pagina A página que será exibida
 * @param {string} tipo O tipo de pontuação 
 */
function CarregarTipo(pagina, tipo)
{
    $.ajax({
        url: 'usuario/getRankings',
        data : {pagina : pagina, tipo : tipo},
        method : 'GET',
        dataType: 'JSON',
        success : function(/**@type {Array.<UsuarioRank>}*/ usuarios)
        {
            console.log(usuarios);
            var htmlString = ""
            for(var i = 0; i < usuarios.length; i++)
            {
                htmlString += "<tr "
                var classe = ""
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
        }
    })
}

$(".btn-pontos").on('click', function()
{
    var atual = $(".btn.pontos.active");
    if(atual.is($(this)))
    {
        return;
    }
    
    CarregarTipo(undefined, $(this).data('tipo'));
    $(this).addClass("active");
});

