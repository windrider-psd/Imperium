function GetEdificios()
{
    let custo = GerenciadorRecursos.GetCustoUpgradeMinaFerro(planeta.minaFerro + 1);
    let tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-ferro .edificio-nivel").text(planeta.minaFerro);
    $("#edificio-ferro .custo-ferro span").text(custo.ferro);
    $("#edificio-ferro .custo-cristal span").text(custo.cristal);
    $("#edificio-ferro .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro + 1) - GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro)) * 6)+ "/minuto");
    $("#edificio-ferro .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeMinaCristal(planeta.minaFerro + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-cristal .edificio-nivel").text(planeta.minaCristal);
    $("#edificio-cristal .custo-ferro span").text(custo.ferro);
    $("#edificio-cristal .custo-cristal span").text(custo.cristal);
    $("#edificio-cristal .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal + 1) - GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal)) * 6)+ "/minuto");
    $("#edificio-cristal .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradePlantaSolar(planeta.plantaSolar + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    let intensidadeSolar = GerenciadorRecursos.GetIntensidadeSolarPlaneta(posSolObj, posPlanetaObj, setor.intensidadeSolar);
    $("#edificio-planta-solar .edificio-nivel").text(planeta.plantaSolar);
    $("#edificio-planta-solar .custo-ferro span").text(custo.ferro);
    $("#edificio-planta-solar .custo-cristal span").text(custo.cristal);
    $("#edificio-planta-solar .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEnergiaPlantaSolar(planeta.plantaSolar + 1, intensidadeSolar) - GerenciadorRecursos.GetProducaoEnergiaPlantaSolar(planeta.plantaSolar, intensidadeSolar)) * 6)+ " total");
    $("#edificio-planta-solar .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeReatorFusao(planeta.reatorFusao + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-reator-fusao .edificio-nivel").text(planeta.reatorFusao);
    $("#edificio-reator-fusao .custo-ferro span").text(custo.ferro);
    $("#edificio-reator-fusao .custo-cristal span").text(custo.cristal);
    $("#edificio-reator-fusao .custo-uranio span").text(custo.uranio);
    $("#edificio-reator-fusao .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEnergiaReatorFusao(planeta.reatorFusao + 1) - GerenciadorRecursos.GetProducaoEnergiaReatorFusao(planeta.reatorFusao)) * 6)+ " total");
    $("#edificio-reator-fusao .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeMinaUranio(planeta.minaUranio + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-uranio .edificio-nivel").text(planeta.minaUranio);
    $("#edificio-uranio .custo-ferro span").text(custo.ferro);
    $("#edificio-uranio .custo-cristal span").text(custo.cristal);
    $("#edificio-uranio .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoUranio(planeta.minaUranio + 1) - GerenciadorRecursos.GetProducaoUranio(planeta.minaUranio)) * 6)+ "/minuto");
    $("#edificio-uranio .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeFabricaEletronica(planeta.fabricaEletronica + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-fabrica-eletronica .edificio-nivel").text(planeta.fabricaEletronica);
    $("#edificio-fabrica-eletronica .custo-ferro span").text(custo.ferro);
    $("#edificio-fabrica-eletronica .custo-cristal span").text(custo.cristal);
    $("#edificio-fabrica-eletronica .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoEletronica(planeta.fabricaEletronica + 1) - GerenciadorRecursos.GetProducaoEletronica(planeta.fabricaEletronica)) * 6) + "/minuto");
    $("#edificio-fabrica-eletronica .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeSintetizadorCombustivel(planeta.fabricaEletronica + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-sintetizador-combustivel .edificio-nivel").text(planeta.sintetizadorCombustivel);
    $("#edificio-sintetizador-combustivel .custo-ferro span").text(custo.ferro);
    $("#edificio-sintetizador-combustivel .custo-cristal span").text(custo.cristal);
    $("#edificio-sintetizador-combustivel .custo-uranio span").text(custo.uranio);
    $("#edificio-sintetizador-combustivel .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoCombustivel(planeta.sintetizadorCombustivel + 1) - GerenciadorRecursos.GetProducaoCombustivel(planeta.sintetizadorCombustivel)) * 6) + "/minuto");
    $("#edificio-sintetizador-combustivel .edificio-tempo-melhoria-antes span").text(tempoMelhoria);

    custo = GerenciadorRecursos.GetCustoUpgradeFazenda(planeta.fazenda + 1);
    tempoMelhoria = GerenciadorRecursos.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
    $("#edificio-fazenda .edificio-nivel").text(planeta.fazenda);
    $("#edificio-fazenda .custo-ferro span").text(custo.ferro);
    $("#edificio-fazenda .custo-cristal span").text(custo.cristal);
    $("#edificio-fazenda .edificio-melhoria-producao").text("+" + String((GerenciadorRecursos.GetProducaoComida(planeta.fazenda + 1) - GerenciadorRecursos.GetProducaoComida(planeta.fazenda)) * 6) + "/minuto");
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
function setEdificioMelhoria(JEdificio, tempo, id)
{
    let btnUpgrade = JEdificio.find(".btn-ugrade-edificio");
    let btnCancelar = JEdificio.find(".btn-calcelar-melhoria");
    let tempoMelhoria = JEdificio.find(".edificio-tempo-melhoria-depois");
    JEdificio.find(".edificio-tempo-melhoria-antes").hide();
    btnUpgrade.removeClass("btn-success");
    btnUpgrade.addClass("btn-primary");
    btnUpgrade.text("Edificio sendo melhorado");
    btnUpgrade.prop('disabled', true);
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
    btnUpgrade.removeClass("btn-primary");
    btnUpgrade.addClass("btn-success");
    btnUpgrade.text("Melhorar Edificio");
    btnUpgrade.prop('disabled', false);
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
            data : {planeta: idPlaneta, edificio : id},
            method : "POST",
            beforeSend : function()
            {
                btn.text("Cancelando...")
            },
            success : function()
            {
                GerarNotificacao("Melhoria cancelada com sucesso", 'success');
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger');
            },
            complete : function()
            {
                btn.text("Cancelar Melhoria");
            }
        });
    };

    GerarConfirmacao("Ao cancelar a melhoria, todos os recursos serão perdidos. Você tem certeza que deseja cancelar a melhoria?", cancelar);
    
})

$(".btn-ugrade-edificio").on('click', function()
{
    let btn = $(this);
    let divEdificio = $(this).closest('.edificio');
    let edificio = divEdificio.data('edificio');
    $.ajax({
        url : 'edificio/melhorar',
        data : {planeta : idPlaneta, edificio : edificio},
        method : "POST",
        dataType : 'JSON',
        beforeSend : function()
        {
            btn.text("Processando...");
        },
        success : function(resposta)
        {
            GerarNotificacao("Edificio sendo melhorado", 'success');
            setEdificioMelhoria(divEdificio, resposta.duracao, resposta.edificioID);
            let custo = GerenciadorRecursos.GetCustoEdificioPorId(edificio, planeta[edificio] + 1)
            
            $("#recurso-ferro .recurso-atual").text($("#recurso-ferro .recurso-atual").text() - custo.ferro);
            $("#recurso-cristal .recurso-atual").text($("#recurso-cristal .recurso-atual").text() - custo.cristal);
            $("#recurso-uranio .recurso-atual").text($("#recurso-uranio .recurso-atual").text() - custo.uranio);

        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, "danger");
        },
        complete : function()
        {
            btn.text("Melhorar");
        }
        
    })
});


        
socket.on('cancelar-melhoria', function(data)
{
    let stringEdificio = GerenciadorRecursos.EdificioIDParaString(data.edificio);
    let JEdificio = $(".edificio").data('edificio', stringEdificio);

    UndoMelhoria(JEdificio);
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