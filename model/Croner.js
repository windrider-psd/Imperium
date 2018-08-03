var models = require('./DBModels');
var cron = require('node-cron');
var GR = require('./GerenciadorRecursos');
var construcoes = new Array();
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
                    let producao = GR.GetProducaoTotal({
                        fabricaEletronica : planeta.fabricaEletronica,
                        fazenda : planeta.fazenda,
                        minaCristal : planeta.minaCristal,
                        minaFerro : planeta.minaFerro,
                        minaUranio : planeta.minaUranio,
                        sintetizador : planeta.sintetizadorCombustivel
                    }, planeta.plantaSolar, planeta.reatorFusao, {
                        x: setor.solPosX,
                        y : setor.solPosY
                    }, {
                        x : planeta.posX,
                        y : planeta.posY
                    }, setor.intensidadeSolar);
                    let updateFerro = producao.ferro + planeta.recursoFerro; 
                    let updateCristal = producao.cristal + planeta.recursoCristal;
                    models.Planeta.update({recursoFerro : updateFerro, recursoCristal : updateCristal}, {where : {id : planeta.id}});

                });
            });
        });
    }
})
/**
 * @param {number} planetaID O id do planeta da construção
 * @param {number} edificio O nome da coluna do edificio
 * @param {number} duracao A duração da construção em segundos
 * @description Adiciona uma construção à um planeta
 */
function AdicionarConstrucao(planetaID, edificio, duracao)
{
    models.Construcao.create({planetaID : planetaID, edificio : edificio, duracao : duracao}).then((construcao)=>
    {
        let timeout = setTimeout(() => 
        {
            models.Planeta.findOne({where : {id : planetaID}}).then((planeta) =>{
                let valorObj = {};
                valorObj[edificio] = edificio;
                planeta[edificio] = planeta[edificio] + 1;
                planeta.save();
            });
            RemoverConstrucao(construcao.id);
        }, duracao * 1000);
        construcoes.push({id : construcao.id, timeout : timeout});
       
    })
}

/**
 * 
 * @param {number} idConstrucao O id da construção
 * @description Remove uma construção de um planeta
 */
function RemoverConstrucao(idConstrucao)
{
    for(let i = 0; i < construcoes.length; i++)
    {
        if(construcoes[i].id == idConstrucao)
        {
            clearTimeout(construcoes[i].timeout);
            models.Construcao.destroy({where : {id : construcoes[i].id}});
            construcoes.splice(i, 1);
            console.log("Eliminou");
            break;
        }
    }
}
   

module.exports = {
    Recursos : adicionarRecurso,
    AdicionarConstrucao : AdicionarConstrucao,
    RemoverConstrucao : RemoverConstrucao
}