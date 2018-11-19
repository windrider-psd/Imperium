let prefabs = require('./Nave')

/**
 * Retorna o prefab da nave cujo possui o nome da tabela
 * @param {string} nome 
 */
function getNavePorNomeTabela(nome)
{
    for (let chave in prefabs) 
    {
        let nave = prefabs[chave]

        if(nave.nome_tabela == nome)
        {
            return Object.assign( Object.create( Object.getPrototypeOf(nave)), nave)
        }
    }
}
/**
 * Retorna o tempo de construção de uma nave
 * @param {Nave} nave 
 * @param {number} nivelHangar
 * @returns {number}
 */
function getTempoConstrucao(nave, nivelHangar)
{
    let dividendo = 0;
    for(let chave in nave.custo)
    {
        dividendo += nave.custo[chave];
    }
    
    let divisor = 150 * nivelHangar
    return Math.ceil(dividendo / divisor)
}

module.exports ={
    getNavePorNomeTabela : getNavePorNomeTabela,
    getTempoConstrucao : getTempoConstrucao
}