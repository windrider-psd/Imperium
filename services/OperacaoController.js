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
            models.Operacao_Militar.update({atual : setorDestino.id}, {where : {id : operacaoID}})
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
            var rotaIterator = null;
            var rotaIteradorIndex = null
            var rota = null
            
            /*let menorVelocidade = 99999999999999999;
            for(let n in frotaOperacao)
            {
                let nave = naveBuilder.getNavePorNomeTabela(n)
                if(nave != null && nave.velocidade < menorVelocidade)
                {
                    menorVelocidade = nave.velocidade
                }
            }*/


            function Fase2()
            {
                models.Usuario.findOne({where : {id : operacao.usuarioID}})
                    .then(usuario => {
                        models.Setor.update({usuarioID : usuario.id}, {where : {id : setorDestino.id}})
                            .then(() => {
                                models.Planeta.update({colonizado : true}, {where : {setorID : setorDestino.id}})
                                    .then(() => {

                                        models.Frota.findOne({where : {operacaoID : operacaoID, usuarioID : usuario.id}})
                                            .then(frotaOP => {

                                                delete frotaOP.dataValues.usuarioID
                                                delete frotaOP.dataValues.planetaID
                                                delete frotaOP.dataValues.id
                                                delete frotaOP.dataValues.operacaoID
                                                delete frotaOP.dataValues.relatorioID

                                                models.Planeta.findAll({where : {setorID : setorDestino.id}})
                                                    .then((planetas) => {

                                                        let primeiro = null

                                                        for(let i = 0; i < planetas.length; i++)
                                                        {
                                                            if(i == 0)
                                                            {
                                                                primeiro = planetas[i]
                                                            }
                                                            models.Frota.update({usuarioID : usuario.id}, {where : {planetaID : planetas[i].id}})
                                                        }


                                                        models.Frota.findOne({where : {planetaID : primeiro.id}})
                                                            .then(frotaPlaneta => {
                                                                delete frotaPlaneta.dataValues.usuarioID
                                                                delete frotaPlaneta.dataValues.planetaID
                                                                delete frotaPlaneta.dataValues.id
                                                                delete frotaPlaneta.dataValues.operacaoID
                                                                delete frotaPlaneta.dataValues.relatorioID

                                                                let frotaUpdateOBJ = {}

                                                                for(let chave in frotaOP.dataValues)
                                                                {
                                                                    frotaUpdateOBJ[chave] = frotaOP.dataValues[chave] + frotaPlaneta.dataValues[chave]
                                                                }
                                                                models.Frota.update(frotaUpdateOBJ, {where : {planetaID : primeiro.id}})
                                                                
                                                            })
                                                      
                                                    })
                                            })
                                        
                                       
                                        models.Operacao_Militar.destroy({where : {id : operacaoID}})
                                    })
                            })
                    })
            }

            function Fase1()
            {
                let mover = function() {
                    return new Promise((resolve, reject) => {
                        MoverFrota(operacao.id, setorAtual, setorDestino, {})
                            .then(() => {
                                rotaIteradorIndex++
                                rotaIterator = rota[rotaIteradorIndex]
                                models.Setor.findOne({where : {posX : rotaIterator.posX, posY : rotaIterator.posY}})
                                    .then((setor) => {
                                        setorAtual = setor;
                                        if(setorAtual.id != setorDestino.id)
                                        {
                                            mover()
                                                .then(() => {
                                                    resolve();
                                                })
                                        }
                                        else
                                        {
                                            resolve()
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
                                        models.Operacao_Militar.update({estagio : 2}, {where : {id : operacaoID}})
                                            .then(() => {
                                                Fase2()
                                            })
                                        
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                            else if(operacao.estagio == 2)
                            {
                                Fase2()
                            }
                            
                        }

                    })

        })
    
}

module.exports = {
    Colonizar : Colonizar
}