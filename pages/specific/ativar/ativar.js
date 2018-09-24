let $ = require('jquery')
let utils = require('./../../general/userdata/utils')

$(document).ready(function(){
    let params = utils.ParseGET()
    $.ajax({
        method : 'POST',
        data : params,
        url : 'usuario/validar-esqueci-senha',
        success : function()
        {
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
})