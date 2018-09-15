const $ = require('jquery')
const utils = require('./../../general/userdata/utils')
const GerenciadorRecursos = require('./../../../services/shared/GerenciadorRecursos')
let setorinfo = utils.GetSetorInfo();
let planeta = setorinfo.planeta
let setor = setorinfo.setor
let posSolObj = {x : setor.solPosX, y : setor.solPosX}
let posPlanetaObj = {x : planeta.posX, y : planeta.posY}
function setEdificioMelhoria(JEdificio, tempo, id)
{
    let btnUpgrade = JEdificio.find(".btn-ugrade-edificio");
    let btnCancelar = JEdificio.find(".btn-calcelar-melhoria");
    let tempoMelhoria = JEdificio.find(".edificio-tempo-melhoria-depois");
    JEdificio.find(".edificio-tempo-melhoria-antes").hide();
    /*btnUpgrade.removeClass("btn-success");
    btnUpgrade.addClass("btn-primary");
    btnUpgrade.text("Edificio sendo melhorado");
    btnUpgrade.prop('disabled', true);*/
    btnUpgrade.addClass('hidden')
    btnCancelar.removeClass('hidden');
    btnCancelar.data('id', id);
    tempoMelhoria.find("span").text(tempo);
    tempoMelhoria.find("JEdificio");
    tempoMelhoria.removeClass("hidden"); 
}

function UndoMelhoria(JEdificio)
{
    let btnUpgrade = JEdificio.find(".btn-ugrade-edificio");
    let btnCancelar = JEdificio.find(".btn-calcelar-melhoria");
    let tempoMelhoria = JEdificio.find(".edificio-tempo-melhoria-depois");
    JEdificio.find(".edificio-tempo-melhoria-antes").show();
    /*btnUpgrade.removeClass("btn-primary");
    btnUpgrade.addClass("btn-success");
    btnUpgrade.text("Melhorar");
    btnUpgrade.prop('disabled', false);*/
    //btnCancelar.removeClass('hidden');
    btnUpgrade.removeClass('hidden');
    btnCancelar.addClass('hidden');
    tempoMelhoria.addClass("hidden"); 
}



$(".btn-calcelar-melhoria").on('click', function()
{
    let btn = $(this);
    let id = btn.data('id');
    let cancelar = function()
    {
        $.ajax({
            url: 'edificio/cancelar-melhoria',
            data : {planeta: planeta.id, edificio : id},
            method : "POST",
            beforeSend : function()
            {
                btn.text("Cancelando...")
            },
            success : function()
            {
                utils.GerarNotificacao("Melhoria cancelada com sucesso", 'success');
                let stringid = GerenciadorRecursos.EdificioIDParaString(id)
                UndoMelhoria($('.edificio[data-edificio="'+stringid+'"]'))
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger');
            },
            complete : function()
            {
                btn.text("Cancelar Melhoria");
            }
        });
    };

    utils.GerarConfirmacao("Ao cancelar a melhoria, todos os recursos serão perdidos. Você tem certeza que deseja cancelar a melhoria?", cancelar);
    
})

$(".btn-ugrade-edificio").on('click', function()
{
    let btn = $(this);
    let divEdificio = $(this).closest('.edificio');
    let edificio = divEdificio.data('edificio');
    $.ajax({
        url : 'edificio/melhorar',
        data : {planeta : planeta.id, edificio : edificio},
        method : "POST",
        dataType : 'JSON',
        beforeSend : function()
        {
            btn.text("Processando...");
        },
        success : function(resposta)
        {
            utils.GerarNotificacao("Edificio sendo melhorado", 'success');
            setEdificioMelhoria(divEdificio, resposta.duracao, resposta.edificioID);
            let custo = GerenciadorRecursos.GetCustoEdificioPorId(edificio, planeta[edificio] + 1)
            
            $("#recurso-ferro .recurso-atual").text($("#recurso-ferro .recurso-atual").text() - custo.ferro);
            $("#recurso-cristal .recurso-atual").text($("#recurso-cristal .recurso-atual").text() - custo.cristal);
            $("#recurso-titanio .recurso-atual").text($("#recurso-titanio .recurso-atual").text() - custo.titanio);

        },
        error : function(err)
        {
            utils.GerarNotificacao(err.responseText, "danger");
        },
        complete : function()
        {
            btn.text("Melhorar");
        }
        
    })
});


setInterval(function(){
    let tempos = $(".edificio-tempo-melhoria-depois");
    tempos.each(function()
    {
        let valor = $(this).find('span');
        if(valor.text() > 0)
            valor.text(String(Number(valor.text()) - 1));
    })
}, 1000)

function GetEdificios()
{
    let isp = GerenciadorRecursos.GetIntensidadeSolarPlaneta(posSolObj, posPlanetaObj, setor.intensidadeSolar)
    let consumo = GerenciadorRecursos.GetConsumoTotal(planeta.minaFerro, planeta.minaCristal, planeta.fabricaComponente, planeta.minaTitanio, planeta.fazenda)
    let producaoEnergia=  GerenciadorRecursos.GetProducaoEnergia(planeta.plantaSolar, planeta.reatorFusao, isp);
    let custo = GerenciadorRecursos.GetCustoUpgradeMinaFerro(planeta.minaFerro + 1);
    let tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    
    $("#edificio-ferro .edificio-nivel").text(planeta.minaFerro);
    $("#edificio-ferro .custo-ferro span").text(custo.ferro);
    $("#edificio-ferro .custo-cristal span").text(custo.cristal);
    $("#edificio-ferro .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro + 1, 1, 1, isp) - GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro, consumo, producaoEnergia, isp)) * 6)+ "/minuto");
    $("#edificio-ferro .edificio-tempo-melhoria-antes span").text(tempoMelhoria);


    custo = GerenciadorRecursos.GetCustoUpgradeMinaCristal(planeta.minaFerro + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-cristal .edificio-nivel").text(planeta.minaCristal);
    $("#edificio-cristal .custo-ferro span").text(custo.ferro);
    $("#edificio-cristal .custo-cristal span").text(custo.cristal);
    $("#edificio-cristal .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal + 1, 1, 1, isp) - GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal, consumo, producaoEnergia, isp)) * 6)+ "/minuto");
    $("#edificio-cristal .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradePlantaSolar(planeta.plantaSolar + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    let intensidadeSolar = GerenciadorRecursos.GetIntensidadeSolarPlaneta(posSolObj, posPlanetaObj, setor.intensidadeSolar);
    $("#edificio-planta-solar .edificio-nivel").text(planeta.plantaSolar);
    $("#edificio-planta-solar .custo-ferro span").text(custo.ferro);
    $("#edificio-planta-solar .custo-cristal span").text(custo.cristal);
    $("#edificio-planta-solar .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEnergiaPlantaSolar(planeta.plantaSolar + 1, isp) - GerenciadorRecursos.GetProducaoEnergiaPlantaSolar(planeta.plantaSolar, isp)) * 6) + " total");
    $("#edificio-planta-solar .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeReatorFusao(planeta.reatorFusao + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-reator-fusao .edificio-nivel").text(planeta.reatorFusao);
    $("#edificio-reator-fusao .custo-ferro span").text(custo.ferro);
    $("#edificio-reator-fusao .custo-cristal span").text(custo.cristal);
    $("#edificio-reator-fusao .custo-titanio span").text(custo.titanio);
    $("#edificio-reator-fusao .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEnergiaReatorFusao(planeta.reatorFusao + 1) - GerenciadorRecursos.GetProducaoEnergiaReatorFusao(planeta.reatorFusao)) * 6)+ " total");
    $("#edificio-reator-fusao .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeMinaTitanio(planeta.minaTitanio + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-titanio .edificio-nivel").text(planeta.minaTitanio);
    $("#edificio-titanio .custo-ferro span").text(custo.ferro);
    $("#edificio-titanio .custo-cristal span").text(custo.cristal);
    $("#edificio-titanio .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoTitanio(planeta.minaTitanio + 1, 1, 1) - GerenciadorRecursos.GetProducaoTitanio(planeta.minaTitanio, consumo, producaoEnergia)) * 6)+ "/minuto");
    $("#edificio-titanio .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeFabricaComponente(planeta.fabricaComponente + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-fabrica-componente .edificio-nivel").text(planeta.fabricaComponente);
    $("#edificio-fabrica-componente .custo-ferro span").text(custo.ferro);
    $("#edificio-fabrica-componente .custo-cristal span").text(custo.cristal);
    $("#edificio-fabrica-componente .custo-titanio span").text(custo.titanio);
    $("#edificio-fabrica-componente .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoComponente(planeta.fabricaComponente + 1, 1, 1) - GerenciadorRecursos.GetProducaoComponente(planeta.fabricaComponente, consumo, producaoEnergia)) * 6) + "/minuto");
    $("#edificio-fabrica-componente .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    
    custo = GerenciadorRecursos.GetCustoUpgradeArmazem(planeta.armazem + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-armazem .edificio-nivel").text(planeta.armazem);
    $("#edificio-armazem .custo-ferro span").text(custo.ferro);
    $("#edificio-armazem .custo-cristal span").text(custo.cristal);
    $("#edificio-armazem .custo-titanio span").text(custo.titanio);
    $("#edificio-armazem .custo-componente span").text(custo.componentes);
    $("#edificio-armazem .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetArmazenamentoArmazem(planeta.armazem + 1) - GerenciadorRecursos.GetArmazenamentoArmazem(planeta.armazem))) + " total de recursos");
    $("#edificio-armazem .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeFazenda(planeta.fazenda + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, planeta.fabricaRobos);
    $("#edificio-fazenda .edificio-nivel").text(planeta.fazenda);
    $("#edificio-fazenda .custo-ferro span").text(custo.ferro);
    $("#edificio-fazenda .custo-cristal span").text(custo.cristal);
    $("#edificio-fazenda .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoComida(planeta.fazenda + 1, 1, 1, isp) - GerenciadorRecursos.GetProducaoComida(planeta.fazenda,consumo, producaoEnergia, isp)) * 6) + "/minuto");
    $("#edificio-fazenda .edificio-tempo-melhoria-antes span").text(tempoMelhoria);
}

function GetConstrucoes()
{
    let divs = $(".edificio")
    for(let i = 0; i < planeta.construcoes.length; i++)
    {

        divs.each(function()
        {
            let dataEdificio = $(this).data('edificio');
            let edificioID = planeta.construcoes[i].edificioID;

            let diferenca = (new Date().getTime() - new Date(planeta.construcoes[i].inicio).getTime()) / 1000
            if(GerenciadorRecursos.GetEdificioID(dataEdificio) == edificioID)
            {
                setEdificioMelhoria($(this),planeta.construcoes[i].duracao - diferenca.toFixed(0), planeta.construcoes[i].edificioID);
                return;
            }
        });
    }
}

GetEdificios()

socket.on('edificio-melhoria-completa', function(data)
{
    let stringEdificio = GerenciadorRecursos.EdificioIDParaString(data.edificioID);
    let JEdificio = $(".edificio[data-edificio='"+stringEdificio+"']");
    UndoMelhoria(JEdificio);
    planeta[stringEdificio] = planeta[stringEdificio] + 1;
    JEdificio.find(".edificio-nivel").text(planeta[stringEdificio]);
    let custo = GerenciadorRecursos.GetCustoEdificioPorId(data.edificioID,  planeta[stringEdificio] + 1);
    let tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.titanio);

    JEdificio.find(".custo-ferro span").text(custo.ferro);
    JEdificio.find(".custo-cristal span").text(custo.cristal);
    JEdificio.find(".custo-titanio span").text(custo.titanio);

    JEdificio.find(".edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoFerro(planeta[stringEdificio] + 1) - GerenciadorRecursos.GetProducaoFerro(planeta[stringEdificio])) * 6)+ "/minuto");
    JEdificio.find(".edificio-tempo-melhoria-antes span").text(tempoMelhoria);
})

socket.on('cancelar-melhoria', function(data)
{
    if(data.planetaID == planeta.id)
    {
        let stringEdificio = GerenciadorRecursos.EdificioIDParaString(data.edificioID);
        let JEdificio = $(".edificio[data-edificio='"+stringEdificio+"']");
        //let custo = GerenciadorRecursos.GetCustoEdificioPorId(data.edificioID);

        UndoMelhoria(JEdificio);
    } 
    
});

socket.on('edificio-melhorando', function(construcao){

    if(construcao.planetaID == planeta.id)
    {
        let stringEdificio = GerenciadorRecursos.EdificioIDParaString(construcao.edificioID);
        let JEdificio = $(".edificio[data-edificio='"+stringEdificio+"']");

        setEdificioMelhoria(JEdificio, construcao.duracao, construcao.edificioID);
    }
    
});

module.exports = {
    GetEdificios : GetEdificios(),
    GetConstrucoes : GetConstrucoes()
}