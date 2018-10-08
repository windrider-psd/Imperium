const $ = require('jquery')
const utils = require('./../../../../generic/modules/utils')
const GerenciadorRecursos = require('./../../../../../../services/shared/GerenciadorRecursos')
const observer = require('./../../../../generic/modules/observer')
const main = require('./../../modules/main')
let setorinfo;
let planeta;


/**
 * 
 * @param {JQuery} JEdificio 
 * @param {number} tempo 
 * @param {number} id 
 */
function setEdificioMelhoria(JEdificio, tempo, id) {
    let btnUpgrade = JEdificio.find(".btn-ugrade-edificio");
    let btnCancelar = JEdificio.find(".btn-calcelar-melhoria");
    let tempoMelhoria = JEdificio.find(".edificio-tempo-melhoria-depois");
    JEdificio.find(".edificio-tempo-melhoria-antes").hide();
    btnUpgrade.addClass('hidden')
    btnCancelar.removeClass('hidden');
    btnCancelar.data('id', id);
    let overlaymaster = JEdificio.find("edificio-img-overlay-master")
    overlaymaster.find("edificio-img-overlay-fill").css('top', '0px')
    overlaymaster.css('display', 'block');

    tempoMelhoria.find("span").text(tempo);
    tempoMelhoria.find("JEdificio");
    tempoMelhoria.removeClass("hidden");
}

function UndoMelhoria(JEdificio) {
    let btnUpgrade = JEdificio.find(".btn-ugrade-edificio");
    let btnCancelar = JEdificio.find(".btn-calcelar-melhoria");
    let tempoMelhoria = JEdificio.find(".edificio-tempo-melhoria-depois");
    JEdificio.find(".edificio-tempo-melhoria-antes").show();
    let overlaymaster = JEdificio.find(".edificio-img-overlay-master")
    overlaymaster.find(".edificio-img-overlay-fill").css('top', '0px')
    overlaymaster.css('display', 'none');
    btnUpgrade.removeClass('hidden');
    btnCancelar.addClass('hidden');
    tempoMelhoria.addClass("hidden");
}

function GetEdificios(posSolObj, posPlanetaObj, setor) {
    let isp = GerenciadorRecursos.GetIntensidadeSolarPlaneta(posSolObj, posPlanetaObj, setor.intensidadeSolar)
    let consumo = GerenciadorRecursos.GetConsumoTotal(planeta.minaFerro, planeta.minaCristal, planeta.fabricaComponente, planeta.minaTitanio, planeta.fazenda)
    let producaoEnergia = GerenciadorRecursos.GetProducaoEnergia(planeta.plantaSolar, planeta.reatorFusao, isp);
    let custo = GerenciadorRecursos.GetCustoUpgradeMinaFerro(planeta.minaFerro + 1);
    let tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    let custoEnergia = GerenciadorRecursos.GetConsumoMinaFerro(planeta.minaFerro + 1) - GerenciadorRecursos.GetConsumoMinaFerro(planeta.minaFerro)
    $("#edificio-ferro .edificio-nivel").text(planeta.minaFerro);
    $("#edificio-ferro .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-ferro .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-ferro .custo-energia span").html("<span>" + custoEnergia + "</span>");;
    $("#edificio-ferro .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro + 1, 1, 1, isp) - GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro, consumo, producaoEnergia, isp)) * 6) + "/minuto");
    $("#edificio-ferro .edificio-tempo-melhoria-antes span").text(tempoMelhoria);


    custo = GerenciadorRecursos.GetCustoUpgradeMinaCristal(planeta.minaFerro + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    custoEnergia = GerenciadorRecursos.GetConsumoMinaFerro(planeta.minaFerro + 1) - GerenciadorRecursos.GetConsumoMinaFerro(planeta.minaFerro)
    $("#edificio-cristal .edificio-nivel").text(planeta.minaCristal);
    $("#edificio-cristal .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-cristal .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-cristal .custo-energia span").html("<span>" + custoEnergia + "</span>");;
    $("#edificio-cristal .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal + 1, 1, 1, isp) - GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal, consumo, producaoEnergia, isp)) * 6) + "/minuto");
    $("#edificio-cristal .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradePlantaSolar(planeta.plantaSolar + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    custoEnergia = GerenciadorRecursos.GetConsumoMinaCristal(planeta.minaCristal + 1) - GerenciadorRecursos.GetConsumoMinaCristal(planeta.minaCristal)
    $("#edificio-planta-solar .edificio-nivel").text(planeta.plantaSolar);
    $("#edificio-planta-solar .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-planta-solar .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-planta-solar .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEnergiaPlantaSolar(planeta.plantaSolar + 1, isp) - GerenciadorRecursos.GetProducaoEnergiaPlantaSolar(planeta.plantaSolar, isp)) * 6) + " total");
    $("#edificio-planta-solar .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeReatorFusao(planeta.reatorFusao + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-reator-fusao .edificio-nivel").text(planeta.reatorFusao);
    $("#edificio-reator-fusao .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-reator-fusao .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-reator-fusao .custo-titanio span").html("<span>" + custo.titanio + "</span>");
    $("#edificio-reator-fusao .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEnergiaReatorFusao(planeta.reatorFusao + 1) - GerenciadorRecursos.GetProducaoEnergiaReatorFusao(planeta.reatorFusao)) * 6) + " total");
    $("#edificio-reator-fusao .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeMinaTitanio(planeta.minaTitanio + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    custoEnergia = GerenciadorRecursos.GetConsumoMinaTitanio(planeta.minaTitanio + 1) - GerenciadorRecursos.GetConsumoMinaTitanio(planeta.minaTitanio)
    $("#edificio-titanio .edificio-nivel").text(planeta.minaTitanio);
    $("#edificio-titanio .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-titanio .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-titanio .custo-energia span").html("<span>" + custoEnergia + "</span>");;
    $("#edificio-titanio .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoTitanio(planeta.minaTitanio + 1, 1, 1) - GerenciadorRecursos.GetProducaoTitanio(planeta.minaTitanio, consumo, producaoEnergia)) * 6) + "/minuto");
    $("#edificio-titanio .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeFabricaComponente(planeta.fabricaComponente + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    custoEnergia = GerenciadorRecursos.GetConsumoFabricaComponente(planeta.fabricaComponente + 1) - GerenciadorRecursos.GetConsumoFabricaComponente(planeta.fabricaComponente)
    $("#edificio-fabrica-componente .edificio-nivel").text(planeta.fabricaComponente);
    $("#edificio-fabrica-componente .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-fabrica-componente .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-fabrica-componente .custo-titanio span").html("<span>" + custo.titanio + "</span>");
    $("#edificio-fabrica-componente .custo-energia span").html("<span>" + custoEnergia + "</span>");;
    $("#edificio-fabrica-componente .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoComponente(planeta.fabricaComponente + 1, 1, 1) - GerenciadorRecursos.GetProducaoComponente(planeta.fabricaComponente, consumo, producaoEnergia)) * 6) + "/minuto");
    $("#edificio-fabrica-componente .edificio-tempo-melhoria-antes span").text(tempoMelhoria);


    custo = GerenciadorRecursos.GetCustoUpgradeArmazem(planeta.armazem + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-armazem .edificio-nivel").text(planeta.armazem);
    $("#edificio-armazem .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-armazem .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-armazem .custo-titanio span").html("<span>" + custo.titanio + "</span>");
    $("#edificio-armazem .custo-componente span").html("<span>" + custo.componentes + "</span>")
    $("#edificio-armazem .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetArmazenamentoArmazem(planeta.armazem + 1) - GerenciadorRecursos.GetArmazenamentoArmazem(planeta.armazem))) + " total de recursos");
    $("#edificio-armazem .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeFazenda(planeta.fazenda + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    custoEnergia = GerenciadorRecursos.GetConsumoFazenda(planeta.fazenda + 1) - GerenciadorRecursos.GetConsumoFazenda(planeta.fazenda)
    $("#edificio-fazenda .edificio-nivel").text(planeta.fazenda);
    $("#edificio-fazenda .custo-ferro span").html("<span>" + custo.ferro + "</span>");
    $("#edificio-fazenda .custo-cristal span").html("<span>" + custo.cristal + "</span>");
    $("#edificio-fazenda .custo-energia span").html("<span>" + custoEnergia + "</span>");;
    $("#edificio-fazenda .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoComida(planeta.fazenda + 1, 1, 1, isp) - GerenciadorRecursos.GetProducaoComida(planeta.fazenda, consumo, producaoEnergia, isp)) * 6) + "/minuto");
    $("#edificio-fazenda .edificio-tempo-melhoria-antes span").text(tempoMelhoria);
}

function GetConstrucoes() {
    let divs = $(".edificio")
    for (let i = 0; i < planeta.construcoes.length; i++) {

        divs.each(function () {
            let dataEdificio = $(this).data('edificio');
            let edificioID = planeta.construcoes[i].edificioID;

            let diferenca = (new Date().getTime() - new Date(planeta.construcoes[i].inicio).getTime()) / 1000
            if (GerenciadorRecursos.GetEdificioID(dataEdificio) == edificioID) {
                setEdificioMelhoria($(this), planeta.construcoes[i].duracao - diferenca.toFixed(0), planeta.construcoes[i].edificioID);
                $(this).find(".edificio-img-overlay-master").css('display', 'block')
                return;
            }
        });
    }
}

observer.Observar('userdata-ready',  () => {
	setorinfo = main.GetSetorInfo();
	planeta = setorinfo.planeta
	let setor = setorinfo.setor
	let posSolObj = {
		x: setor.solPosX,
		y: setor.solPosX
	}
	let posPlanetaObj = {
		x: planeta.posX,
		y: planeta.posY
	}

	$(".btn-calcelar-melhoria").on('click', function () {
		let btn = $(this);
		let id = btn.data('id');
		let cancelar = function () {
			$.ajax({
				url: 'edificio/cancelar-melhoria',
				data: {
					planeta: planeta.id,
					edificio: id
				},
				method: "POST",
				beforeSend: function () {
					btn.text("Cancelando...")
				},
				success: function () {
					utils.GerarNotificacao("Melhoria cancelada com sucesso", 'success');
					//let stringid = GerenciadorRecursos.EdificioIDParaString(id)
					//UndoMelhoria($('.edificio[data-edificio="' + stringid + '"]'))
				},
				error: function (err) {
					utils.GerarNotificacao(err.responseText, 'danger');
				},
				complete: function () {
					btn.text("Cancelar Melhoria");
				}
			});
		};

		utils.GerarConfirmacao("Ao cancelar a melhoria, todos os recursos serão perdidos. Você tem certeza que deseja cancelar a melhoria?", cancelar);

	})

	$(".btn-ugrade-edificio").on('click', function () {
		let btn = $(this);
		let divEdificio = $(this).closest('.edificio');
		let edificio = divEdificio.data('edificio');
		$.ajax({
			url: 'edificio/melhorar',
			data: {
				planeta: planeta.id,
				edificio: edificio
			},
			method: "POST",
			dataType: 'JSON',
			beforeSend: function () {
				btn.text("Processando...");
			},
			success: function (resposta) {
				utils.GerarNotificacao("Edificio sendo melhorado", 'success');
				//setEdificioMelhoria(divEdificio, resposta.duracao, resposta.edificioID);

				let esta = false
				for (let i = 0; i < planeta.construcoes.length; i++) {

					if (planeta.construcoes[i].edificioID == resposta.edificioID) {
						planeta.construcoes[i] = resposta
						esta = true;
						break
					}
				}
				if (!esta)
					planeta.construcoes.push(resposta)

				

			},
			error: function (err) {
				utils.GerarNotificacao(err.responseText, "danger");
			},
			complete: function () {
				btn.text("Melhorar");
			}

		})
	});



	GetEdificios(posSolObj, posPlanetaObj, setor)
    GetConstrucoes()

    setInterval(function () {
        let tempos = $(".edificio-tempo-melhoria-depois");
        tempos.each(function () {
            let valor = $(this).find('span');
            if (valor.text() > 0)
                valor.text(String(Number(valor.text()) - 1));
        })
        let construcoes = planeta.construcoes
        let remover = []
        for (let i = 0; i < construcoes.length; i++) {
            let stringid = GerenciadorRecursos.EdificioIDParaString(construcoes[i].edificioID)
            let JEdificio = $('.edificio[data-edificio="' + stringid + '"]')
            let diferenca = (new Date().getTime() - new Date(construcoes[i].inicio).getTime()) / 1000
            diferenca = diferenca.toFixed(0)
            let tempo = construcoes[i].duracao - diferenca;
            if (tempo < 0) {
                remover.push({
                    Jedi: JEdificio,
                    index: i
                })
                continue
            }
    
            let porcentual = 100 - ((100 * diferenca) / construcoes[i].duracao)
            let px = (250 * porcentual) / 100
            px = (px - 250) * -1
    
    
            JEdificio.find(".edificio-img-overlay-master").css('display', 'block')
            JEdificio.find(".edificio-img-overlay-fill").css('top', px.toFixed(0) + "px")
            JEdificio.find(".edificio-img-overlay-text").text(construcoes[i].duracao - diferenca)
        }
        for (let i = 0; i < remover.length; i++) {
            remover[i].Jedi.find(".edificio-img-overlay-master").css('display', 'none')
            planeta.construcoes.splice(remover[i].index, 1)
    
        }
    }, 1000)
})

observer.Observar('socket-ready', () => {
	socket.on('edificio-melhoria-completa', (data) => {
		let stringEdificio = GerenciadorRecursos.EdificioIDParaString(data.edificioID);
		planeta[stringEdificio] = planeta[stringEdificio] + 1;
		let JEdificio = $(".edificio[data-edificio='" + stringEdificio + "']");
		UndoMelhoria(JEdificio);
		planeta[stringEdificio] = planeta[stringEdificio] + 1;
		JEdificio.find(".edificio-nivel").text(planeta[stringEdificio]);
		let custo = GerenciadorRecursos.GetCustoEdificioPorId(data.edificioID, planeta[stringEdificio]);
		//let tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.titanio);

		JEdificio.find(".custo-ferro span").html("<span>" + custo.ferro + "</span>");
		JEdificio.find(".custo-cristal span").html("<span>" + custo.cristal + "</span>");
        JEdificio.find(".custo-titanio span").html("<span>" + custo.titanio + "</span>");
        
		for (let i = 0; i < planeta.construcoes.length; i++) {
			if (planeta.construcoes[i].edificioID == data.edificioID) {
				planeta.construcoes.splice(i, 1)
				break
			}
		}
	})

	socket.on('cancelar-melhoria', (data) => {
		if (data.planetaID == planeta.id) {
			let stringEdificio = GerenciadorRecursos.EdificioIDParaString(data.edificioID);
            let JEdificio = $(".edificio[data-edificio='" + stringEdificio + "']");
            
			for (let i = 0; i < planeta.construcoes.length; i++) {
				if (planeta.construcoes[i].edificioID == data.edificioID) {
					planeta.construcoes.splice(i, 1)
					break
				}
            }
			UndoMelhoria(JEdificio);
		}

	});

	socket.on('edificio-melhorando', (construcao) => {
		if (construcao.planetaID == planeta.id) {
			let stringEdificio = GerenciadorRecursos.EdificioIDParaString(construcao.edificioID);
			let JEdificio = $(".edificio[data-edificio='" + stringEdificio + "']");

			setEdificioMelhoria(JEdificio, construcao.duracao, construcao.edificioID);
			let esta = false
			for (let i = 0; i < planeta.construcoes.length; i++) {

				if (planeta.construcoes[i].edificioID == construcao.edificioID) {
					planeta.construcoes[i] = construcao
					esta = true;
					break
				}
			}
			if (!esta)
				planeta.construcoes.push(construcao)
		}

	});
})

