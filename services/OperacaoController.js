const models = require('./../model/DBModels');
const Bluebird = require('bluebird')
const edificioBuiler = require('./../prefabs/EdificioBuilder')
const edificioPrefab = require('./../prefabs/Edificio')
const navePrefab = require('./../prefabs/Nave')
const naveBuilder = require('./../prefabs/NaveBuilder')
const pathFinder = require('./../services/Pathfinder')


function MoverFrota(operacaoID, setorOrigem, setorDestino, frota)
{
    /*let menorVelocidade = 99999999999999999;
    for(let n in frotaOperacao)
    {
        let nave = naveBuilder.getNavePorNomeTabela(n)
        if(nave != null && nave.velocidade < menorVelocidade)
        {
            menorVelocidade = nave.velocidade
        }
    }*/

    let tempo = 10;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            models.Operacao_Militar.update({atual : setorDestino}, {where : {id : operacaoID}})
                .then(() => {
                    resolve();
                }) 
                .catch(err => {
                    reject(err)
                })

        }, tempo * 1000)
    })
}


function Colonizar(operacaoID)
{
    models.Operacao_Militar.findOne({where : {id : operacaoID}})
        .then((operacao) => {
            let setorOrigem = null
            let setorDestino = null
            let setorAtual = null
            let rotaIterator = null;
            let rotaIteradorIndex = null
            let rota = null
            
            /*let menorVelocidade = 99999999999999999;
            for(let n in frotaOperacao)
            {
                let nave = naveBuilder.getNavePorNomeTabela(n)
                if(nave != null && nave.velocidade < menorVelocidade)
                {
                    menorVelocidade = nave.velocidade
                }
            }*/

            function Fase1()
            {
                let mover = function() {
                    return new Promise((resolve, reject) => {
                        MoverFrota(operacao.id, setorAtual, setorDestino, {})
                            .then(() => {
                                rotaIteradorIndex++
                                rotaIterator = [rotaIteradorIndex]
                                models.Setor.findOne({where : {posX : rotaIterator.posX, posY : rotaIterator.posY}})
                                    .then((setor) => {
                                        setorAtual = setor;
                                        if(setorAtual.id == setorDestino.id)
                                        {
                                            mover()
                                                .then(() => {
                                                    resolve();
                                                })
                                        }
                                    })
    
                            });
                           
                    })
                }
                return new Promise((resolve, reject) => {
                    mover()
                        .then(() => {
                            resolve();
                        }) 
                })


            }


            models.Setor.findAll(
                {
                    where : 
                    {
                        $or:
                        [
                            {id : operacao.origem},
                            {id : operacao.destino},
                            {id : operacao.atual}
                        ]
                        
                    }
                }
                )
                    .then(setores => 
                    {
                       
                        for(let i = 0; i < setores.length; i++)
                        {
                            if(setores[i].id == operacao.origem)
                            {
                                setorOrigem = setores[i]
                            }
                            if(setores[i].id == operacao.destino)
                            {
                                setorDestino = setores[i]
                            }
                            if(setores[i].id == operacao.atual)
                            {
                                setorAtual = setores[i]
                            }
                        }

                        if(operacao.estagio == 1)
                        {
                            if(setorAtual.id != setorDestino.id)
                            {
                                rota = pathFinder.encontrarRota({posX : setorAtual.posX, posY : setorAtual.posY}, {posX : setorDestino.posX, posY : setorDestino.posY})
                                rotaIteradorIndex = 0
                                rotaIterator = rota[rotaIteradorIndex]
                                Fase1()
                                    .then(() => {
                                        console.log("chegou")
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                            
                            
                        }

                    })

        })
    
}

module.exports = {
    Colonizar : Colonizar
}