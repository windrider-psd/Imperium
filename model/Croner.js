var models = require('./DBModels');
var cron = require('node-cron');
var GerenciadorRecursos = require('./GerenciadorRecursos');

/**
 * @description Cron job para adicionar recursos para os jogadores
 */
var adicionarRecurso = cron.schedule('*/10 * * * * *', function()
{
    if(models.isReady())
    {
        models.Planeta.findAll({where : {colonizado : true}}).then((planetas) =>
        {
            planetas.forEach(function(planeta)
            {
                models.Setor.findOne({where : {id : planeta.setorID}}).then((setor) =>{

                    console.log(setor);
                    let producao = GerenciadorRecursos.GetProducaoTotal({
                        FabricaEletronica : planeta.fabricaEletronica,
                        fazenda : planeta.fazenda,
                        minaCristal : planeta.minaCristal,
                        minaFerro : planeta.minaFerro,
                        minaUranio : planeta.minaUranio,
                        sintetizador : planeta.sintetizadorCombustivel
                    }, planeta.plantaSolar, planeta.reatorFusao, {
                        x: setor.posSolX,
                        y : setor.posSolY
                    }, {
                        x : planeta.posX,
                        y : planeta.posY
                    }, setor.intensidadeSolar);


                    var updateFerro = producao.minaFerro + planeta.recursoFerro; 
                    var updateCristal = producao.minaCristal + planeta.recursoCristal;
                    models.Planeta.update({recursoFerro : updateFerro, recursoCristal : updateCristal}, {where : {id : planeta.id}});

                });
            });
        });
    }
    
})


module.exports = {
    Recursos : adicionarRecurso
}