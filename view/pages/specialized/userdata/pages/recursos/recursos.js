const $ = require('jquery')
const utils = require('./../../../../generic/modules/utils')
const GerenciadorRecursos = require('./../../../../../../services/shared/GerenciadorRecursos')
const observer = require('./../../../../generic/modules/observer')
const main = require('./../../modules/main')
let prefabs = require('./../../../../../../prefabs/Edificio')
let builder = require('./../../../../../../prefabs/EdificioBuilder')

let setorinfo;
let planeta;

window.edificios = {}

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
    let overlaymaster = JEdificio.find(".edificio-img-overlay-master")
    overlaymaster.find(".edificio-img-overlay-fill").css('top', '0px')
    overlaymaster.css('display', 'block');

    tempoMelhoria.find("span").text(tempo);
    //tempoMelhoria.find("JEdificio");
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



/**
 * 
 * @param {Edificio} edificio 
 */
function getHTMLEdificio(edificio, isp)
{
    let custoNivelAtual = edificio.melhoria(edificio.nivel, 0, 1)
    let custoNivelProximo = edificio.melhoria(edificio.nivel + 1, 0, 1)

    let custo = {}
    for(let chave in custoNivelAtual)
    {
        custo[chave] = custoNivelProximo[chave] - custoNivelAtual[chave]
    }

    let consumo = edificio.consumo(edificio.nivel + 1) - edificio.consumo(edificio.nivel);
    

    let recursosString = ""

    for(let chave in custo)
    {
        if(custo[chave] != 0)
        {
            recursosString += 
            `
            <div class="custo-${chave}">
                <div class="imperium-resource imperium-resource-${chave}"></div>
                <span><span>${custo[chave]}</span></span>
            </div>
            `
        }
    }
    if(consumo != 0)
    {
        recursosString += 
        `
        <div class="custo-energia">
            <div class="imperium-resource imperium-resource-energia"></div>
            <span>${consumo}</span>
        </div>
        `
    }
    


    let producao = edificio.producao(edificio.nivel, 0,1, isp)

    let producaoTotal = 0;
    
    for(let chave in producao)
    {
        producaoTotal += producao[chave]
    }

    let producaoString = ""
    if(producaoTotal > 0)
    {
        let producaoProx = edificio.producao(edificio.nivel + 1, 0, 1, isp)
        let producaoDif ={}
        for(let chave in producaoProx)
        {
            producaoDif[chave] = producaoProx[chave] - producao[chave]
        }
        producaoString = 'Diferença em produção com melhoria: <span class="edificio-melhoria-producao text-success"><b>'
        for(let chave in producaoDif)
        {
            if(producaoDif[chave] != 0)
            {
                producaoString += `${chave}:+${producaoDif[chave]}`
            }
           
        }
        producaoString += "</b></span>"
    }

    let htmlString = 
    `
    <div class="col-md-12 edificio" data-edificio="${edificio.nome_tabela}">
        <div class="col-md-2 edificio-img imperium-gradient-background-medium">
            <img src="/images/${edificio.icone}">
            <div class="edificio-img-overlay-master">
                <div class="edificio-img-overlay-fill"></div>
                <div class="edificio-img-overlay-text"></div>
            </div>
        </div>
        <div class="col-md-6 edificio-desc imperium-gradient-background-medium">
            <div class="edificio-desc-titulo">
                <h4>${edificio.nome}</h4>
                <span>Nível:  <span class="edificio-nivel">${edificio.nivel}</span></span>
            </div>
            <div>
                <span>Custo de melhoria</span>
                <div class="imperium-resource-list">
                    ${recursosString}
                </div>
                <div style="clear:both"><span class="edificio-tempo-melhoria-antes">Tempo de melhoria: <span>${builder.getTempoConstrucao(custo, 0)}</span> Segundos</span></div>
                ${producaoString}<br><button class="btn-ugrade-edificio btn btn-success btn-sm btn-block imperium-input" style="margin-top:20px">Melhorar</button><span class="edificio-tempo-melhoria-depois hidden" style="display: block">Tempo de melhoria:<span></span></span><button class="btn-calcelar-melhoria btn btn-warning btn-sm hidden btn-block imperium-input" style="margin-top:10px">Calcelar Melhoria</button>
            </div>
        </div>
    </div>
    `
    return htmlString
}

function GetEdificios(posSolObj, posPlanetaObj, setor) {

    let isp1 = builder.getIntensidadeSolarPlaneta(posSolObj, posPlanetaObj, setor.intensidadeSolar)

    let htmlString = ""
    for(let chave in prefabs)
    {
        let edit = builder.getEdificio(chave)
        edit.nivel = planeta[chave]
        window.edificios[chave] = edit
        htmlString += getHTMLEdificio(edit, isp1)
    }
    

    $("main").html(htmlString)
}

function GetConstrucoes() {
    let divs = $(".edificio")
    for (let i = 0; i < planeta.construcoes.length; i++) {
        
        divs.each(function () {
            let dataEdificio = $(this).data('edificio');
            let edificioString = planeta.construcoes[i].edificio;

            let diferenca = (new Date().getTime() - new Date(planeta.construcoes[i].inicio).getTime()) / 1000
            if (edificioString == dataEdificio) {
                setEdificioMelhoria($(this), planeta.construcoes[i].duracao - diferenca.toFixed(0), planeta.construcoes[i].edificio);
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

	$("main").on('click', ".btn-calcelar-melhoria", function () {
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

	$("main").on('click', ".btn-ugrade-edificio", function () {
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
            let stringid = construcoes[i].edificio
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
			let stringEdificio = data.edificio;
            let JEdificio = $(".edificio[data-edificio='" + stringEdificio + "']");
            
			for (let i = 0; i < planeta.construcoes.length; i++) {
				if (planeta.construcoes[i].edificio == stringEdificio) {
					planeta.construcoes.splice(i, 1)
					break
				}
            }
			UndoMelhoria(JEdificio);
		}

	});

	socket.on('edificio-melhorando', (construcao) => {
		if (construcao.planetaID == planeta.id) {
			let stringEdificio = construcao.edificio;
			let JEdificio = $(".edificio[data-edificio='" + stringEdificio + "']");

			setEdificioMelhoria(JEdificio, construcao.duracao, construcao.edificio);
			let esta = false
			for (let i = 0; i < planeta.construcoes.length; i++) {

				if (planeta.construcoes[i].edificio == construcao.edificio) {
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

