const $ = require('jquery')
const utils = require('./utils')

let planeta = utils.GetSetorInfo().planeta
$(document).ready(function()
{
    $(".link-planeta").each(function()
    {
        _url = $(this).attr('href');
        _url += (_url.split('?')[1] ? '&':'?') + 'planetaid=' + planeta.id;
        $(this).attr('href', _url)
    })

    if(planeta)
        $("#nome-planeta").text(planeta.nome);
    else
        utils.GerarNotificacao("Planeta não encontrado", 'danger');
});