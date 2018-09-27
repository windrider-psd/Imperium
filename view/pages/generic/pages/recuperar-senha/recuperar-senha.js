let $ = require('jquery')
let utils = require('./../../modules/utils')

$(document).ready(function(){

    let params = utils.ParseGET()
    $.ajax({
        method : 'POST',
        data : params,
        url : 'usuario/validar-recuperar-senha',
        success : function()
        {
            $("#esqueci-form-id").val(params.u)
            $("#esqueci-form-chave").val(params.chave)
            $(".div-sucesso").removeClass('hidden')
        },
        error : function(err)
        {
            let json = JSON.parse(err.responseText)
            $(".texto-erro").text(json.conteudo)
            $(".div-erro").removeClass('hidden')
        },
        complete : function()
        {
            $(".div-ativando").css('display', 'none')
        }
        
    });

    $("#esqueci-form").on('submit', function()
    {
        var info = utils.FormToAssocArray($(this));
        var btn = $(this).find("btn[type='submit']");
        $.ajax({
        method : 'POST',
        data : info,
        url : 'usuario/resetar-senha',
        beforeSend : function()
        {
            btn.html("Redefinindo...");
        },
        success : function()
        {
            alert("Senha redifinida com sucesso");
            window.location.href = "/";
        },
        error : function(erro)
        {
            utils.GerarNotificacao(erro.responseText, "danger");
        },
        complete : function()
        {
            btn.html("Redifinir Senha");
        }
        
        });
    });
})

