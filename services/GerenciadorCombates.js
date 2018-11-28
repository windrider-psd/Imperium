const models = require('./../model/DBModels');
const naveBuilder = require('./../prefabs/NaveBuilder')
let ranking = require('./Ranking')
let aleatorio = require("./Aleatorio")

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
    constructor(operacaoId, setorAlvoId, callback)
    {
        this.operacaoId = operacaoId
        this.setorAlvoId = setorAlvoId
        this.callback = callback
    }
    executar()
    {
        combatev2(this.operacaoId, this.setorAlvoId)
            .then((resultado) => {
                liberarReserva(this.setorAlvoId)
                this.callback(resultado)
            }) 
    }
}

let reservas = {}

function reservarCombate(operacaoId, setorDefensorId, callback)
{
    if(reservas[setorDefensorId] == null)
    {
        reservas[setorDefensorId] = {combatendo : false, combates : []}
    }
    
    reservas[setorDefensorId].combates.push(new Combate(operacaoId, setorDefensorId, callback))
}






async function combatev2(operacaoID, setorDefensorId)
{
    return new Promise(resolve =>{
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
                            let backupDefensora = Object.assign({}, frotaDefensora)
                            let backupAtacante = Object.assign({}, frotaOP.dataValues)
                            Combater(frotaOP.dataValues, frotaDefensora)
                                .then(resultado => {
                                    console.log(resultado)
                                    let custoAtacante = {}
                                    for(let chave in resultado.atacante)
                                    {
                                        let diferenca = backupAtacante[chave] - resultado.atacante[chave]
                                        
                                        let nave = naveBuilder.getNavePorNomeTabela(chave)
                                        for(let chaveCusto in nave.custo)
                                        {
                                            if(custoAtacante[chaveCusto] == null)
                                            {
                                                custoAtacante[chaveCusto] = 0
                                            }
                                            custoAtacante[chaveCusto] += nave.custo[chaveCusto] * diferenca;
                                        }
                                    }
                                    for(let chave in custoAtacante)
                                    {
                                        custoAtacante[chave] = custoAtacante[chave]  * -1
                                    }
        
                                    let custoDefensor = {}
                                    for(let chave in resultado.defensora)
                                    {
                                        let diferenca = backupDefensora[chave] - resultado.defensora[chave]
                                       
                                        let nave = naveBuilder.getNavePorNomeTabela(chave)
                                        for(let chaveCusto in nave.custo)
                                        {
                                            
                                            if(custoDefensor[chaveCusto] == null)
                                            {
                                                custoDefensor[chaveCusto] = 0
                                            }
                                            custoDefensor[chaveCusto] += nave.custo[chaveCusto] * diferenca;

                                        }
                                    }
                                    for(let chave in custoDefensor)
                                    {
                                        custoDefensor[chave] = custoDefensor[chave]  * -1
                                    }
                                    models.Operacao_Militar.findOne({where : {id : operacaoID}, attributes : ['usuarioID']})
                                        .then(op => {
                                            ranking.AdicionarPontos(op.usuarioID, custoAtacante, ranking.TipoPontos.pontosMilitar);
                                        })
                                    

                                    models.Setor.findOne({where : {id : setorDefensorId}, attributes : ['usuarioID']})
                                        .then(set => {
                                            ranking.AdicionarPontos(set.usuarioID, custoDefensor, ranking.TipoPontos.pontosMilitar);
                                        })
                                    
                                    

                                    models.Frota.update(resultado.atacante, {where : {operacaoID : operacaoID}})
                                        .then(() => {
                                            models.Planeta.findOne({where : {setorID : setorDefensorId, colonizado : true}})
                                                .then(planeta => {
                                                    if(planeta)
                                                    {
                                                        models.Frota.update(resultado.defensora, {where : {planetaID : planeta.id}})
                                                            .then(() => {
                                                                resolve(resultado)
                                                            })
                                                    }
                                                })
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
        if(reservas[chave].combates.length > 0 && reservas[chave].combatendo == false)
        {
            console.log("Executando combate...")
            reservas[chave].combatendo = true;
            reservas[chave].combates[0].executar()
        }
    }
}, 5000)

function liberarReserva(setorId)
{
    console.log("Liberando combate...")
    reservas[setorId].combates.splice(0, 1)
    reservas[setorId].combatendo = false
}

function combaterEmSetor(operacaoID, setorDefensorId, callback)
{
    console.log("Reservando combate...")
    reservarCombate(operacaoID, setorDefensorId, callback)
}

module.exports = {
    combaterEmSetor : combaterEmSetor,
}