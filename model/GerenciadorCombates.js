async function Combater(frotaAtacante, frotaDefensora)
{
    return new Promise((resolve, reject) => 
    {
        function setFrotaObjAlvo(frotaSet, FrotaAlvo)
        {
            for(let i = 0; i < frotaSet.length; i++)
            {
                let naveOBJ = frotaSet[i]
                let alvoIndex = aleatorio.GerarIntAleatorio(FrotaAlvo.length - 1 , 0)
                naveOBJ.alvo = alvoIndex
            }
        }

        function executarDanoFrotaObj(frotaDanificadora, frotaVitima)
        {
            for(let i = 0; i < frotaDanificadora.length; i++)
            {
                let naveOBJ = frotaDanificadora[i]
                let alvo = frotaVitima[naveOBJ.alvo]

                let quantidadesHits = 0
                for(let j = 0; j < naveOBJ.nave.quantidade_armas; j++)
                {
                    let hitValor = aleatorio.GerarIntAleatorio(100, 0)
                    if(hitValor <= alvo.nave.evasao)
                    {
                        quantidadesHits++
                    }
                }
                
                let dano = (naveOBJ.nave.dano - naveOBJ.nave.armadura) * quantidadesHits

                alvo.nave.hp -= dano
                
            }
        }

        function getSobreviventesFrotaObj(frotaObj)
        {
            let sobrevivientes = []
            for(let i = 0; i < frotaObj.length; i++)
            {
                if(frotaObj[i].nave.hp > 0)
                {
                    sobrevivientes.push(frotaObj[i])
                }
            }
            return sobrevivientes
        }

        let objFrotaAtacante = []
        for(let chave in frotaAtacante)
        {
            
            let nave = naveBuilder.getNavePorNomeTabela(chave)
            
            for(let i = 0; i < frotaAtacante[chave]; i++)
            {
                let clone = Object.assign( Object.create( Object.getPrototypeOf(nave)), nave)
                objFrotaAtacante.push({nave : clone, alvo : null})
            }
            
        }

        let objFrotaDefensora = []
        for(let chave in frotaDefensora)
        {
            let nave = naveBuilder.getNavePorNomeTabela(chave)
            
            for(let i = 0; i < frotaDefensora[chave]; i++)
            {
                let clone = Object.assign( Object.create( Object.getPrototypeOf(nave)), nave)
                objFrotaDefensora.push({nave : clone, alvo : null})
            }
            
        }


        
        let intervalo = setInterval(() => 
        {
            //for(let naveOBJ of objFrotaAtacante)
            setFrotaObjAlvo(objFrotaAtacante, objFrotaDefensora)
            setFrotaObjAlvo(objFrotaDefensora, objFrotaAtacante)
            
            executarDanoFrotaObj(objFrotaAtacante, objFrotaDefensora)
            executarDanoFrotaObj(objFrotaDefensora, objFrotaAtacante)

            objFrotaAtacante = getSobreviventesFrotaObj(objFrotaAtacante)
            objFrotaDefensora = getSobreviventesFrotaObj(objFrotaDefensora)

            if(objFrotaAtacante.length == 0 || objFrotaDefensora.length == 0)
            {

                for(let chave in frotaAtacante)
                {
                    frotaAtacante[chave] = 0                
                }

                for(let i = 0; i < objFrotaAtacante.length; i++)
                {
                    let nome_tabela = objFrotaAtacante[i].nave.nome_tabela
                    frotaAtacante[nome_tabela]++
                }

                for(let chave in frotaDefensora)
                {
                    frotaDefensora[chave] = 0                
                }

                for(let i = 0; i < objFrotaDefensora.length; i++)
                {
                    let nome_tabela = objFrotaDefensora[i].nave.nome_tabela
                    frotaDefensora[nome_tabela]++
                }
                clearInterval(intervalo)
                resolve({atacante : frotaAtacante, defensora : frotaDefensora})                
            }

        }, 10000)   

    })
}

class Combate {
    constructor(frotaAtacante,frotaDefensora, callback)
    {
        this.frotaAtacante = frotaAtacante
        this.frotaDefensora = frotaDefensora
        this,callback = callback
    }
    executar()
    {
       return Combater(this.frotaAtacante, this.frotaDefensora) 
    }
}

let reservas = {}

async function reservarCombate(setorId, frotaAtacante, frotaDefensora, callback)
{
    if(reservas[setorId] == null)
    {
        reservas[setorId] = []
    }
    
    reservas[setorId].push(new Combate(frotaAtacante, frotaDefensora, callback))

}


async function combatev2(operacaoID, setorDefensorId, callback)
{

    models.Frota.findOne({where : {operacaoID : operacaoID}})
        .then(frotaOP => {

            delete frotaOP.dataValues.usuarioID
            delete frotaOP.dataValues.planetaID
            delete frotaOP.dataValues.id
            delete frotaOP.dataValues.operacaoID
            delete frotaOP.dataValues.relatorioID

            models.Planeta.findAll({where : {setorID : setorDefensorId}})
                .then(planetasDefensores => {
                    
                    /**
                     * @type {Array.<Promise>}
                     */
                    let promesas = []
                    
                    for(let i = 0; i < planetasDefensores.length; i++)
                    {
                        promesas.push(new Promise((resolve) => {
                            let id = planetasDefensores[i].id
                            models.Frota.findOne({where : {planetaID : id}})
                                .then(frota => {
                                    delete frota.dataValues.usuarioID
                                    delete frota.dataValues.planetaID
                                    delete frota.dataValues.id
                                    delete frota.dataValues.operacaoID
                                    delete frota.dataValues.relatorioID

                                    let frotaUpdate = {}

                                    for(let chave in frota.dataValues)
                                    {
                                        frotaUpdate[chave] = 0
                                    }
                                    
                                    models.Frota.update(frotaUpdate, {where : {planetaID : id}})
                                        .then(() => {
                                            resolve(frota.dataValues)
                                        })
                                    
                                })
                        }))
                    }

                    Promise.all(promesas)
                        .then(frotasDefensoras => {
                            let frotaDefensora = {}
                            for(let i = 0; i < frotasDefensoras.length; i++)
                            {
                                for(let chave in frotaOP.dataValues)
                                {
                                    if(frotaDefensora[chave] == null)
                                    {
                                        frotaDefensora[chave] = 0
                                    }
                                    frotaDefensora[chave] += frotasDefensoras[i][chave]
                                }
                            }
                            console.log(frotaOP.dataValues)
                            console.log(frotaDefensora)

                            Combater(frotaOP.dataValues, frotaDefensora)
                                .then(resultado => {
                                    console.log(resultado)
                                    models.Frota.update(resultado.atacante, {where : {operacaoID : operacaoID}})
                                        .then(() => {
                                            models.Planeta.findOne({where : {setorID : setorDestino.id, colonizado : true}})
                                                .then(planeta => {
                                                    if(planeta)
                                                    {
                                                        models.Frota.update(resultado.defensora, {where : {planetaID : planeta.id}})
                                                            .then(() => {
                                                                resolve()
                                                            })
                                                    }
                                                })
                                        })
                                })
                        })
                })
            })
                                    
}

setInterval(() => {
    for(let chave in reservas)
    {
        if(reservas[chave].length > 0)
        {
            reservas[chave][0].executar()
                .then(resultado => {
                    reservas[chave][0].callback(resultado);
                })
        }
    }
}, 5000)

function liberarReserva(setorId)
{
    reservas[setorId][0]
}

module.exports = {
    reservarCombate : reservarCombate,
}