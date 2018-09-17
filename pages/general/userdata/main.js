const $ = require('jquery')
const utils = require('./utils')
require('select2')
let planeta = utils.GetSetorInfo().planeta
$(document).ready(function()
{
    if(planeta)
        $("#nome-planeta").text(planeta.nome);
    else
        utils.GerarNotificacao("Planeta não encontrado", 'danger');

    
    $("#select-planeta option[value='"+planeta.id+"']").attr('selected', true)
    $('#select-planeta').select2({width : '100%'});
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