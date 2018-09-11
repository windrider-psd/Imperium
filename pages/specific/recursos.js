const $ = require('jquery')
const utils = require('./../general/userdata/utils')
let GerenciadorRecursos = require('./../../services/shared/GerenciadorRecursos')

let info = utils.GetSetorInfo()
let planeta = info.planeta
let setor = info.setor
let posSolObj = {x : setor.solPosX, y : setor.solPosY}
let posPlanetaObj = {x : planeta.posX, y : planeta.posY}

$(document).ready(function() {
    function GetRecursos(nivelArmazem)
    {
        let totalArmazenamento = GerenciadorRecursos.GetTotalArmazenamentoRecursos(nivelArmazem);
        $(".total-armazenavel").text(totalArmazenamento);
        let producao = GerenciadorRecursos.GetProducaoTotal({
            fabricaEletronica : planeta.fabricaEletronica,
            fazenda : planeta.fazenda,
            minaCristal : planeta.minaCristal,
            minaFerro : planeta.minaFerro,
            minaUranio : planeta.minaUranio,
            sintetizador : planeta.sintetizadorCombustivel
        }, planeta.plantaSolar, planeta.reatorFusao, {
            x : setor.solPosX,
            y : setor.solPosY
        }, {
            x : planeta.posX,
            y : planeta.posY
        }, setor.intensidadeSolar);
        $("#recurso-ferro .recurso-atual").text(planeta.recursoFerro);
        $("#recurso-ferro .recurso-producao").text("+" + producao.ferro * 6 + "/minuto");
        
        $("#recurso-cristal .recurso-atual").text(planeta.recursoCristal);
        $("#recurso-cristal .recurso-producao").text("+" + producao.cristal * 6 + "/minuto");

        $("#recurso-uranio .recurso-atual").text(planeta.recursoUranio);
        $("#recurso-uranio .recurso-producao").text("+" + producao.uranio * 6 + "/minuto");

        $("#recurso-eletronica .recurso-atual").text(planeta.recursoEletronica);
        $("#recurso-eletronica .recurso-producao").text("+" + producao.eletronica * 6 + "/minuto");

        $("#recurso-combustivel .recurso-atual").text(planeta.recursoCombustivel);
        $("#recurso-combustivel .recurso-producao").text("+" + producao.combustivel * 6 + "/minuto");

        $("#recurso-comida .recurso-atual").text(planeta.recursoComida);
        $("#recurso-comida .recurso-producao").text("+" + producao.comida * 6 + "/minuto");
        let producaoEnergia = GerenciadorRecursos.GetEnergia(planeta.plantaSolar, planeta.reatorFusao, posSolObj, posPlanetaObj, setor.intensidadeSolar)
        let consumoEnergia = GerenciadorRecursos.GetConsumoTotal(planeta.minaFerro, planeta.minaCristal, planeta.minaUranio, planeta.fabricaEletronica, planeta.sintetizadorCombustivel, planeta.fazenda);
        let valorEnergia = producaoEnergia - consumoEnergia;
        let positivo = (valorEnergia >= 0);
        if(positivo)
        {
            $("#recurso-energia .recurso-atual").text("+" + String(valorEnergia));
            $("#recurso-energia .recurso-atual").addClass("text-success");
            $("#recurso-energia .recurso-atual").removeClass("text-danger");
        }
        else
        {
            $("#recurso-energia .recurso-atual").text(String(valorEnergia));
            $("#recurso-energia .recurso-atual").addClass("text-danger");
            $("#recurso-energia .recurso-atual").removeClass("text-success");
        }
    }


    if(planeta)
    {
        $("title").text(planeta.nome + " - Imperium");
        GetRecursos(planeta.armazem);
    }
})
socket.on('recurso-planeta' + planeta.id, function(update)
{
    $("#recurso-ferro .recurso-atual").text(update.recursoFerro);
    $("#recurso-cristal .recurso-atual").text(update.recursoCristal);
    $("#recurso-uranio .recurso-atual").text(update.recursoUranio);
    $("#recurso-eletronica .recurso-atual").text(update.recursoEletronica);
    $("#recurso-combustivel .recurso-atual").text(update.recursoCombustivel);
    $("#recurso-comida .recurso-atual").text(update.recursoComida);
})