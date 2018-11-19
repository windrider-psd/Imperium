const $ = require('jquery')
const GerenciadorRecursos = require('./../../../../../services/shared/GerenciadorRecursos')
const observer = require('./../../../generic/modules/observer')
const main = require('./../modules/main')
let prefabs = require('./../../../../../prefabs/Edificio')
let builder = require('./../../../../../prefabs/EdificioBuilder')

require('select2')

observer.Observar('userdata-ready', function ()
{
	/*let selectstring = ""
	for (let i = 0; i < userdata.setores.length; i++)
	{
		let setor = userdata.setores[i]
		selectstring += '<optgroup label="' + setor.setor.nome + '[' + setor.setor.posX + ',' + setor.setor.posY + ']">';
		for (let j = 0; j < setor.planetas.length; j++)
		{
			if (setor.planetas[j].colonizado == true)
			{
				let selected = (planeta == setor.planetas[j].id) ? "selected" : ""
				selectstring += '<option value = "' + setor.planetas[j].id + '" ' + selected + '>' + setor.planetas[j].nome + '</option>'
			}
		}
		selectstring += "</optgroup>"
	}
	$("#select-planeta").html(selectstring)
	$('#select-planeta').select2(
	{
		width: '100%'
	});*/


	if (planeta)
	{
		$("title").text(planeta.nome + " - Imperium");
		GetRecursos(planeta.armazem);
	}


	function GetRecursos(nivelArmazem)
	{
	
		
		let isp = builder.getIntensidadeSolarPlaneta({x : setorinfo.setor.solPosX, y : setorinfo.setor.solPosY}, {x : planeta.posX, y : planeta.posY}, setorinfo.setor.intensidadeSolar);
		let edificios = {};
		for(let chave in prefabs)
		{
			let edit = builder.getEdificio(chave)
			
			edit.nivel = planeta[chave]
		
			edificios[chave] = edit;
		}
		
		
		let producao = builder.getProducao(edificios, isp);
		$("#recurso-ferro .recurso-atual").text(planeta.recursoFerro);
		$("#recurso-ferro .recurso-producao").text("+" + producao.ferro * 6 + "/minuto");
		$(".recurso-capacidade").text(producao.capacidade)
		$("#recurso-cristal .recurso-atual").text(planeta.recursoCristal);
		$("#recurso-cristal .recurso-producao").text("+" + producao.cristal * 6 + "/minuto");

		$("#recurso-titanio .recurso-atual").text(planeta.recursoTitanio);
		$("#recurso-titanio .recurso-producao").text("+" + producao.titanio * 6 + "/minuto");

		$("#recurso-componente .recurso-atual").text(planeta.recursoComponente);
		$("#recurso-componente .recurso-producao").text("+" + producao.componente * 6 + "/minuto");

		$(".total-armazenavel").text(producao.capacidade);

		$("#recurso-energia .energia-atual").text(producao.energia)
		$("#recurso-energia .energia-consumo").text(producao.consumo)

		let positivo = producao.energia >= producao.consumo
		if (positivo)
		{
			$("#recurso-energia .recurso-atual").text(`+${producao.energia}`);
			$("#recurso-energia .recurso-atual").addClass("text-success");
			$("#recurso-energia .recurso-atual").removeClass("text-danger");
		}
		else
		{
			$("#recurso-energia .recurso-atual").text(`-${producao.energia}`);
			$("#recurso-energia .recurso-atual").addClass("text-danger");
			$("#recurso-energia .recurso-atual").removeClass("text-success");
		}
	}
})

observer.Observar('socket-ready',  () =>
{
	socket.on('recurso-planeta' + planeta.id,  (update) =>
	{
		$("#recurso-ferro .recurso-atual").text(update.recursoFerro);
		$("#recurso-cristal .recurso-atual").text(update.recursoCristal);
		$("#recurso-titanio .recurso-atual").text(update.recursoTitanio);
		$("#recurso-componente .recurso-atual").text(update.recursoComponente);
		$("#recurso-combustivel .recurso-atual").text(update.recursoCombustivel);
	})
})