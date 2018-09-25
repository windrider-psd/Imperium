const $ = require('jquery')
require('select2')
const utils = require('./../../general/userdata/utils')
let GerenciadorRecursos = require('./../../../services/shared/GerenciadorRecursos')
let planeta
const observer = require('./../observer')
observer.Observar('userdata-ready', function () {
    let info = utils.GetSetorInfo()
    planeta = info.planeta
    let selectstring = ""
    for(let i = 0; i < userdata.setores.length; i++)
    {
        let setor = userdata.setores[i]
        selectstring += '<optgroup label="'+setor.setor.nome+'[' + setor.setor.posX + ',' + setor.setor.posY + ']">';
        for(let j = 0; j < setor.planetas.length; j++)
        {
            if(setor.planetas[j].colonizado == true)
            {
                let selected = (info.planeta == setor.planetas[j].id) ? "selected" : ""
                selectstring += '<option value = "'+setor.planetas[j].id+'" '+selected+'>'+setor.planetas[j].nome+'</option>'
            }
        }
        selectstring += "</optgroup>"
    }
    $("#select-planeta").html(selectstring)
    $('#select-planeta').select2({width : '100%'});
	
	
	let setor = info.setor
	let posSolObj = {
		x: setor.solPosX,
		y: setor.solPosY
	}
	let posPlanetaObj = {
		x: planeta.posX,
		y: planeta.posY
	}


	if (planeta) {
		$("title").text(planeta.nome + " - Imperium");
		GetRecursos(planeta.armazem);
	}


	function GetRecursos(nivelArmazem) {
		let totalArmazenamento = GerenciadorRecursos.GetTotalArmazenamentoRecursos(nivelArmazem);
		$(".total-armazenavel").text(totalArmazenamento);
		let producao = GerenciadorRecursos.GetProducaoTotal({
			fabricaComponente: planeta.fabricaComponente,
			fazenda: planeta.fazenda,
			minaCristal: planeta.minaCristal,
			minaFerro: planeta.minaFerro,
			minaTitanio: planeta.minaTitanio,
		}, planeta.plantaSolar, planeta.reatorFusao, {
			x: setor.solPosX,
			y: setor.solPosY
		}, {
			x: planeta.posX,
			y: planeta.posY
		}, setor.intensidadeSolar);
		$("#recurso-ferro .recurso-atual").text(planeta.recursoFerro);
		$("#recurso-ferro .recurso-producao").text("+" + producao.ferro * 6 + "/minuto");
		$(".recurso-capacidade").text(totalArmazenamento)
		$("#recurso-cristal .recurso-atual").text(planeta.recursoCristal);
		$("#recurso-cristal .recurso-producao").text("+" + producao.cristal * 6 + "/minuto");

		$("#recurso-titanio .recurso-atual").text(planeta.recursoTitanio);
		$("#recurso-titanio .recurso-producao").text("+" + producao.titanio * 6 + "/minuto");

		$("#recurso-componente .recurso-atual").text(planeta.recursoComponente);
		$("#recurso-componente .recurso-producao").text("+" + producao.componente * 6 + "/minuto");

		$("#recurso-combustivel .recurso-atual").text(planeta.recursoCombustivel);
		$("#recurso-combustivel .recurso-producao").text("+" + producao.combustivel * 6 + "/minuto");

		$("#recurso-comida .recurso-atual").text(planeta.recursoComida);
		$("#recurso-comida .recurso-producao").text("+" + producao.comida * 6 + "/minuto");
		let producaoEnergia = GerenciadorRecursos.GetEnergia(planeta.plantaSolar, planeta.reatorFusao, posSolObj, posPlanetaObj, setor.intensidadeSolar)
		let consumoEnergia = GerenciadorRecursos.GetConsumoTotal(planeta.minaFerro, planeta.minaCristal, planeta.fabricaComponente, planeta.minaTitanio, planeta.fazenda);
		let valorEnergia = producaoEnergia - consumoEnergia;
		let positivo = (valorEnergia >= 0);

		$("#recurso-energia .energia-atual").text(producaoEnergia)
		$("#recurso-energia .energia-consumo").text(consumoEnergia)
		if (positivo) {
			$("#recurso-energia .recurso-atual").text("+" + String(valorEnergia));
			$("#recurso-energia .recurso-atual").addClass("text-success");
			$("#recurso-energia .recurso-atual").removeClass("text-danger");
		} else {
			$("#recurso-energia .recurso-atual").text(String(valorEnergia));
			$("#recurso-energia .recurso-atual").addClass("text-danger");
			$("#recurso-energia .recurso-atual").removeClass("text-success");
		}
	}

})

observer.Observar('socket-ready', function () {
	socket.on('recurso-planeta' + planeta.id, function (update) {
		$("#recurso-ferro .recurso-atual").text(update.recursoFerro);
		$("#recurso-cristal .recurso-atual").text(update.recursoCristal);
		$("#recurso-titanio .recurso-atual").text(update.recursoTitanio);
		$("#recurso-componente .recurso-atual").text(update.recursoComponente);
		$("#recurso-combustivel .recurso-atual").text(update.recursoCombustivel);
		$("#recurso-comida .recurso-atual").text(update.recursoComida);
	})
})