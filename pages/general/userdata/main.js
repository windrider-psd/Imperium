const $ = require('jquery')
const utils = require('./utils')
let planeta = utils.GetSetorInfo().planeta
$(document).ready(function()
{
    if(planeta)
        $("#nome-planeta").text(planeta.nome);
    else
        utils.GerarNotificacao("Planeta não encontrado", 'danger');
});