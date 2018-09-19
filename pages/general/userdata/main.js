const $ = require('jquery')
const utils = require('./utils')
const observer = require('./../observer')
let planeta


$(document).ready(function(){
    $.ajax({
        url : 'usuario/get-userdata',
        method : 'get',
        success : function(userdata)
        {
            window.userdata = userdata
            observer.Trigger('userdata-ready')
        },
    
        error : function(err)
        {
            utils.GerarNotificacao("Falha ao conseguir os dados de usuário: " + err.responseText, 'danger')
        }
        
    })
})


observer.Observar('userdata-ready', function()
{
    planeta = utils.GetSetorInfo().planeta
    if(planeta)
        $("#nome-planeta").text(planeta.nome);
    else
        utils.GerarNotificacao("Planeta não encontrado", 'danger');

    
    $("#select-planeta option[value='"+planeta.id+"']").attr('selected', true)

    $('#select-planeta').on('change', function()
    {
        let val = $(this).val();
        let gets = utils.ParseGET(window.location.search.substring(1))
        gets['planetaid'] = val
        delete gets['']
        let url = window.location.pathname + "?"
        for(let get in gets)
        {
            url+= get + '=' + gets[get] + "&"
        }
        url = url.slice(0, -1)

        window.location.href = url
    })
});