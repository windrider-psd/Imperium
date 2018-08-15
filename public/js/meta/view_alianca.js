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