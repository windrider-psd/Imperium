let $ = require('jquery')
const observer = require('./../../../../generic/modules/observer')
const utils = require('./../../../../generic/modules/utils')
function getMilitar(planetaID)
{
    $.ajax({
        url : "militar/frota",
        method : "GET",
        data: {planetaid : planetaID},
        dataType : "JSON",
        success : (unidades) => {
            console.log(unidades);
        },
        error : (err) => {
            utils.GerarNotificacao(err.responseText, "error");
        }
    })
}


observer.Observar('userdata-ready',  () => {
    getMilitar(window.planeta.id)
})