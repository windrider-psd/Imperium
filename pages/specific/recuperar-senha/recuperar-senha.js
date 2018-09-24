let $ = require('jquery')
let utils = require('./../../general/userdata/utils')
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