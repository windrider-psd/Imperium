let prefabs = require('./Edificio')
/**
 * @description Retorna um clone de um protótipo de edifício com o nome da tabela
 * @param {string} nome_tabela 
 * @returns {Edificio|null} 
 */
function getEdificio(nome_tabela)
{
    for(let chave in prefabs)
    {
        /**
         * @type {Edificio}
         */
        let edificio = prefabs[chave]
        
        if(edificio.nome_tabela == nome_tabela)
        {
            let clone = Object.assign( Object.create( Object.getPrototypeOf(edificio)), edificio)
            return clone
        }
    }
    return null
}

/**
 * @param {Object} [posSol] A posição x e y do sol do sistema
 * @param {Number} [posSol.x] A posição do eixo X do sol
 * @param {Number} [posSol.y] A posição do eixo Y do sol
 * @param {Object} [posPlaneta] A posicao x e y do planeta
 * @param {Number} [posPlaneta.x] A posição do eixo X do planeta
 * @param {Number} [posPlaneta.y] A posição do eixo Y do planeta
 * @param {number} intensidadeS A intensidade solar do sistema
 * @description Calcula a intensidade solar que um planeta recebe
 * @returns {number} Intensidade em Integer
 */
function getIntensidadeSolarPlaneta (posSol, posPlaneta, intensidadeSol)
{
    let distancia = Math.sqrt( 
        Math.pow(posSol.x - posPlaneta.x, 2) + Math.pow(posSol.y - posPlaneta.y, 2)
    )
    return intensidadeSol - ( 9 * distancia);
}

function getProducao(edificios, isp)
{
    let producao_energia = 0
    let consumo_energia = 0
    let producao_total = {
        capacidade: 0,
        componente: 0,
        cristal: 0,
        energia: 0,
        ferro: 0,
        titanio: 0
    }
    for(let chave in edificios)
    {
        /**
         * @type {Edificio}
         */
        let edificio = edificios[chave]
        
        if(edificio.produtor_energia == true)
        {
            producao_energia += edificio.producao(edificio.nivel, 0, 0, isp)
        }
        else
        {
            consumo_energia += edificio.consumo(edificio.nivel)
        }
    }

    for(let chave in edificios)
    {
        /**
         * @type {Edificio}
         */
        let edificio = edificios[chave]
        let producao = edificio.producao(edificio.nivel, consumo_energia, producao_energia, isp)

        for(let recurso_chave in producao)
        {
            producao_total[recurso_chave] += producao[recurso_chave]
        }
        
    }
    return producao_total

}

function GetTempoConstrucao(custo, nivelFabricaRobos)
{
    let dividendo = 0;
    for(let chave in custo)
    {
        dividendo += custo[chave];
    }
    
    let divisor = 7 * (1 + nivelFabricaRobos)
    return Math.ceil(dividendo / divisor)
}

module.exports = {
    getEdificio : getEdificio,
    getIntensidadeSolarPlaneta : getIntensidadeSolarPlaneta,
    getProducao : getProducao,
    getTempoConstrucao : GetTempoConstrucao
}