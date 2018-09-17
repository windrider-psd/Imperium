let $ = require('jquery')
let utils = require('./../../general/userdata/utils')
$("#esqueci-form").on('submit', function()
{
    var info = FormToAssocArray($(this));
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
        GerarNotificacao(erro.responseText, "danger");
    },
    complete : function()
    {
        btn.html("Redifinir Senha");
    }
    
    });
});