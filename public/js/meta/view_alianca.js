/**
 * @typedef AplicacaoResposta
 * @property {number} aliancaID
 * @property {number} usuarioID
 * @property {string} texto
 * @property {Object} usuario
 * @property {number} usuario.id
 * @property {string} usuario.nick
 */


/**
 * @typedef GetMembrosResposta
 * @property {boolean} online
 * @property {Object|null} rank O rank/cargo do jogador da aliança
 * @property {Object} usuario
 * @property {number} usuario.id
 * @property {number} usuario.rank O rank de pontuação total do jogador
 * @property {string} usuario.nick
 * @property {boolean} usuario.banido
 * @property {boolean} usuario.ferias
 */

$("#form-criar-alianca").on('submit', function(){
    var params = FormToAssocArray($(this));
    var btn = $(this).find("button");
    $.ajax({
        url : 'alianca/criar-alianca',
        method : 'POST',
        data : params,
        beforeSend : function()
        {
            btn.text("Criando...")
        },
        success : function()
        {
            GerarNotificacao("Aliança criada com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Criar")
        }
    })
});

$("#btn-sair-alianca").on('click', function(){
    btn = $(this);
    $.ajax({
        url : 'alianca/sair-alianca',
        method : 'POST',
        beforeSend : function()
        {
            btn.text("Saindo...")
        },
        success : function()
        {
            GerarNotificacao("Saída realizada com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Sair da Aliança")
        }
    })
});

function setViewGeral()
{
    $.ajax({
        url : 'alianca/getMembros',
        method : 'GET',
        dataType : 'JSON',
        success : function(resultado)
        {
            /**
             * @type {Array.<GetMembrosResposta>}
             */
            resultado;
            var htmlString = ''
            var textoCargo


            if(userdata.alianca.rank == null)
            {
                if(userdata.alianca.lider == userdata.session.id)
                    textoCargo = "Líder"
                else
                    textoCargo = "Sem cargo"
            }
            else
                textoCargo = userdata.alianca.rank.nome

            htmlString += '<div class="table-responsive"><table class="table table-striped" id="tabela-geral-alianca"><tbody> <tr><td>Nome:</td><td class="nome">'+userdata.alianca.nome+'</td></tr><tr><td>TAG:</td><td class="tag">'+userdata.alianca.tag+'</td></tr><tr><td>Membros:</td><td class="membros-contagem">'+userdata.alianca.totalMembros+'</td></tr><tr><td>O seu cargo:</td><td class="cargo">'+textoCargo+'</td></tr></tbody></table></div>'
            htmlString += '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Nick</th><th>Cargo</th><th>Rank</th><th>Banido</th><th>Férias</th><th>Online</th><th>Ações</th></tr></thead><tbody>'

            for(var i = 0; i < resultado.length; i++)
            {
                var stringCargo
                var onlineString
               
                var feriasString = resultado[i].usuario.ferias === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"
                var banidoString = resultado[i].usuario.banido === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"

                if(typeof(resultado[i].online) === 'undefined')
                    onlineString = "Desconhecido"
                else if(resultado[i].online)
                    onlineString = "<span class = 'text-success'><b>Online</b></span>"
                else
                    onlineString = "<span class = 'text-danger'><b>Offline</b></span>"

                if(userdata.alianca.lider == resultado[i].usuario.id)
                    stringCargo = "Líder"
                else
                    stringCargo = (resultado[i].rank == null) ? "Sem Cargo" : resultado[i].rank.nome
                
                htmlString += '<tr><td>'+resultado[i].usuario.nick+'</td><td>'+stringCargo+'</td><td>'+resultado[i].usuario.rank+'</td><td>'+banidoString+'</td><td>'+feriasString+'</td><td>'+onlineString+'</td><td></td></tr>'
            }
            htmlString +="</table></div>"
            $(".tab-content").html(htmlString);


        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
}

$(document).ready(function() {
    if(userdata.alianca != null)
        setViewGeral()
    
})
$("#btn-cancelar-aplicacao").on('click', function(){
    btn = $(this);
    $.ajax({
        url : 'alianca/cancelar-aplicacao',
        method : 'POST',
        beforeSend : function()
        {
            btn.text("Cancelando...")
        },
        success : function()
        {
            GerarNotificacao("Aplicação removida com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Cancelar Aplicação")
        }
    })
})

/**
 * @param {Array.<AplicacaoResposta>} aplicacoes 
 */
function setViewAplicacoes(aplicacoes)
{
    var htmlString = "";

    for(var i = 0; i < aplicacoes.length; i++)
    {
        htmlString += '<div class = "table-responsive"><table class ="table table-striped"><tbody><tr><td>Nome:</td><td>'+aplicacoes[i].usuario.nick+'</td></tr><tr><td colspan="2">'+aplicacoes[i].texto+'</td></tr></table>'
        htmlString += '<button class = "btn btn-success aceitar-btn" data-usuario = "'+aplicacoes[i].usuarioID+'" data-valor = "1">Aceitar</button><button class = "btn btn-danger aceitar-btn" data-usuario = "'+aplicacoes[i].usuarioID+'" data-valor = "0">Rejeitar</button></div><hr>'
    }
    $(".tab-content").html(htmlString);
}

$("#tab-aplicacoes").on('click', function()
{
    $.ajax({
        url : 'alianca/getAplicacoes',
        method : 'GET',
        dataType : "JSON",
        success : function( /**@type {Array.<AplicacaoResposta>} */ resposta)
        {
            setViewAplicacoes(resposta);
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})
$("#tab-geral").on('click', function()
{
    setViewGeral()
})

$(".tab-content").on('click','.aceitar-btn', function()
{
    var valor = $(this).data('valor')
    var usuario = $(this).data('usuario')
    var btn = $(this);
    $.ajax({
        url : 'alianca/aceitar-aplicacao',
        method : 'POST',
        data : {usuario : usuario, valor : valor},
        success : function()
        {
            if(valor == '1')
                GerarNotificacao("Aplicação aceita com sucesso", 'success')
            else
                GerarNotificacao("Aplicação recusada com sucesso", 'success')
            btn.parent().remove();
        },
        error : function(err)
        {
            console.log(err);
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})

$(".tab-btn").on('click', function()
{
    $(".tab-btn.active").removeClass("active")
    $(this).addClass("active");
})

