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