require('dotenv/config')

/**
 * @typedef Ponto
 * @property {number} posX
 * @property {number} posY
*/



/**
 * @param {Ponto} origem
 * @param {Ponto} destino
 */

/**
    * @type {Array.<Ponto>}
*/
let pontosTotais = []


for(let i = 0; i < Number(process.env.UNIVERSE_SIZE_X); i++)
{
    for(let j = 0; j < Number(process.env.UNIVERSE_SIZE_Y); j++)
    {
        pontosTotais.push({posX : i, posY : j})
    }
}


/**
 * 
 * @param {Ponto} ponto 
 * @returns {Array.<Ponto>}
 */
function getVizinhos(ponto)
{
    /**
     * @type {Array.<Ponto>}
     */
    let retorno = [];

    for(let i = 0; i < pontosTotais.length; i++)
    {
        let p = pontosTotais[i]
        if((p.posX == ponto.posX && p.posY == ponto.posY + 1) || //top
            (p.posX == ponto.posX - 1 && p.posY == ponto.posY) || //left
            (p.posX == ponto.posX + 1 && p.posY == ponto.posY) || //right
            (p.posX == ponto.posX && p.posY == ponto.posY - 1))
        {
           retorno.push({posX : p.posX, posY : p.posY});
        } //bottom
    }
    return retorno;
}

/**
 * 
 * @param {Ponto} origem 
 * @param {Ponto} destino 
 */
function encontrarRota(origem, destino)
{
    /**
     * @type {Array.<Ponto>}
     */
    let pontosDisponiveis = [...pontosTotais]

    /**
     * @type {Array.<Array.<Ponto>>}
     */
    let rotas = [];

    rotas.push([{posX: origem.posX, posY : origem.posY}])
    while(rotas.length > 0)
    {
        /**
         * @type {Array.<Array.<Ponto>>}
        */
        let novasRotas = [];
        for(let rota of rotas)
        {
            let ultimoPonto = rota[rota.length - 1]
            let vizinhos = getVizinhos(ultimoPonto);

            for(let vizinho of vizinhos)
            {
                let indexDisponivel = pontosDisponiveis.findIndex((disp) => disp.posX == vizinho.posX && disp.posY == vizinho.posY)
                if(indexDisponivel != -1) //Se disponível
                {
                    pontosDisponiveis.splice(indexDisponivel, 1);
                    let novaRota = [...rota, vizinho]

                    if(vizinho.posX == destino.posX && vizinho.posY == destino.posY)
                    {
                        return novaRota;
                    }
                    else
                    {
                        novasRotas.push([...novaRota]);
                    }
                }
            }
        }
        rotas = [...novasRotas];
        novasRotas = [];
    }
    return null;

}


module.exports = {
    encontrarRota : encontrarRota
}