/**
 * @typedef AplicacaoResposta
 * @property {number} aliancaID
 * @property {number} usuarioID
 * @property {string} texto
 * @property {Object} usuario
 * @property {number} usuario.id
 * @property {string} usuario.nick
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



$(document).ready(function() {
    if(userdata.alianca != null)
    {
        $("#tabela-geral-alianca .nome").text(userdata.alianca.nome)
        $("#tabela-geral-alianca .tag").text(userdata.alianca.tag)
        $("#tabela-geral-alianca .membros-contagem").text(userdata.alianca.totalMembros)
        
        if(userdata.alianca.rank == null)
        {
            if(userdata.alianca.lider == userdata.session.id)
            {
                $("#tabela-geral-alianca .cargo").text("Líder")
            }
            else
            {
                $("#tabela-geral-alianca .cargo").text("Sem cargo")
            }
        }
        else
        {
            $("#tabela-geral-alianca .cargo").text(userdata.alianca.rank.nome)
        }
    }
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