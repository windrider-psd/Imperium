const models = require('./../model/DBModels');
const naveBuilder = require('./../prefabs/NaveBuilder')
const pathFinder = require('./../services/Pathfinder')
let aleatorio = require("./Aleatorio")
let GerenciadorCombates = require('./GerenciadorCombates')
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
    return new Promise(resolve => {
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
                return new Promise(resolve => {
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
                                                                    .then(() => {
                                                                        resolve()
                                                                    })
                                                                
                                                            })
                                                      
                                                    })
                                            })
                                        
                                       
                                        models.Operacao_Militar.destroy({where : {id : operacaoID}})
                                    })
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
                                                    .then(() => {
                                                        resolve()
                                                    })
                                            })
                                        
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            }
                            else if(operacao.estagio == 2)
                            {
                                Fase2()
                                    .then(() => {
                                        resolve()
                                    })
                            }
                            
                        }

                    })
        })
    })
    
}


function Pilhar(operacaoID)
{
    return new Promise((resolve) => {

 
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
        function Fase3()
        {
            
            let mover = function() {
                return new Promise(resolve => {
                    MoverFrota(operacao.id, setorAtual, setorAtual, {})
                        .then(() => {

                            rotaIteradorIndex--
                            rotaIterator = rota[rotaIteradorIndex]
                            models.Setor.findOne({where : {posX : rotaIterator.posX, posY : rotaIterator.posY}})
                                .then((setor) => {
                                    console.log(`setorAtual : ${setorAtual.id} | setor : ${setor.id}`)
                                    setorAtual = setor;
                                    if(setorAtual.id != setorOrigem.id)
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
            return new Promise((resolve) => {
                models.Operacao_Militar.update({estagio : 3}, {where : {id : operacaoID}})
                models.Frota.findOne({where : {operacaoID : operacaoID}})
                    .then(frotaOP => {
                        delete frotaOP.dataValues.usuarioID
                        delete frotaOP.dataValues.planetaID
                        delete frotaOP.dataValues.id
                        delete frotaOP.dataValues.operacaoID
                        delete frotaOP.dataValues.relatorioID

                        let frotaDestruida = true
                        for(let chave in frotaOP.dataValues)
                        {
                            if(frotaOP.dataValues[chave] > 0)
                            {
                                frotaDestruida = false;
                                break
                            }
                        }
                        console.log(frotaDestruida)
                        if(frotaDestruida)
                        {
                            resolve()
                        }
                        else
                        {
                            models.Con.transaction({isolationLevel : "READ COMMITTED", autocommit : false})
                                .then(transacao => {

                                
                            models.Planeta.findAll({where : {setorID : setorDestino.id, colonizado : true}, attributes : ['id'], /*transaction : transacao*/})
                                .then(planetas =>
                                {
                                    let promesasRecursos = []
                                    for(let i = 0; i < planetas.length; i++)
                                    {
                                        promesasRecursos.push(new Promise(resolve => {
                                            let planeta = planetas[i]
                                            models.RecursosPlanetarios.findOne({where : {planetaID : planeta.id}, /*transaction : transacao*/})
                                                .then(recursos => {
                                                    delete recursos.dataValues.planetaID
                                                    delete recursos.dataValues.operacaoID
                                                    delete recursos.dataValues.relatorioID
                                                    resolve({planeta : planeta.id, recursos : recursos.dataValues})
                                                })
                                        })) 
                                    }
                                    Promise.all(promesasRecursos)
                                        .then(recursosInd => {
                                            let loot = {} //Recursos roubados
                                            let chavesRecursos = []
                                            for(let i = 0; i < recursosInd.length; i++)
                                            {
                                                for(let chave in recursosInd[i].recursos)
                                                {
                                                    if(loot[chave] == null)
                                                    {
                                                        chavesRecursos.push(chave)
                                                        loot[chave] = 0
                                                    }
                                                }
                                            }
                                            
                                            let capacidadeTotal = 0
                                            for(let chave in frotaOP.dataValues)
                                            {
                                                let nave = naveBuilder.getNavePorNomeTabela(chave)
                                                capacidadeTotal += nave.capacidade_transporte * frotaOP.dataValues[chave]
                                            }
                                            let capacidadeTomada = 0
                                            let chavesIndex = 0
                                            while(capacidadeTomada < capacidadeTotal)
                                            {
                                                for(let i = 0; i < recursosInd.length; i++)
                                                {
                                                    if(recursosInd[i].recursos[chavesRecursos[chavesIndex]] > 0)
                                                    {
                                                        recursosInd[i].recursos[chavesRecursos[chavesIndex]]--
                                                        loot[chavesRecursos[chavesIndex]]++
                                                        capacidadeTomada++
                                                    }
                                                }

                                                chavesIndex == chavesRecursos.length - 1 ? chavesIndex = 0 : chavesIndex++
                                            }
                                            loot['operacaoID'] = operacaoID
                                            let promessas = []
                                            for(let i = 0; i < recursosInd.length; i++)
                                            {
                                                
                                                promessas.push(models.RecursosPlanetarios.update(recursosInd[i].recursos, {where : {planetaID : recursosInd[i].planeta}, /*transaction : transacao*/}))
                                            }
                                            Promise.all(promessas)
                                                .then(() => {

                                                    models.RecursosPlanetarios.create(loot)
                                                        .then(() => {
                                                            mover()
                                                                .then(() => {

                                                                    models.Planeta.findOne({where : {setorID : setorOrigem.id, colonizado : true}, /*transaction : transacao*/})
                                                                        .then(planeta => {
                                                                            if(planeta)
                                                                            {  
                                                                                models.Frota.findOne({where : {planetaID : planeta.id}, /*transaction : transacao*/})
                                                                                    .then(frotaPlaneta => {
                                                                                        let frotaUpdateObj = {}

                                                                                        for(let chave in frotaOP.dataValues)
                                                                                        {
                                                                                            frotaUpdateObj[chave] = frotaPlaneta.dataValues[chave] + frotaOP.dataValues[chave]
                                                                                        }


                                                                                        models.Frota.update(frotaUpdateObj, {where : {planetaID : planeta.id}, /*transaction : transacao*/})
                                                                                            .then(() => {
                                                                                                models.RecursosPlanetarios.findOne({where :{planetaID : planeta.id}, /*transaction : transacao*/})
                                                                                                    .then(recursosPlaneta => {
                                                                                                        delete recursosPlaneta.dataValues.planetaID
                                                                                                        delete recursosPlaneta.dataValues.operacaoID
                                                                                                        delete recursosPlaneta.dataValues.relatorioID

                                                                                                        let recursosUpdateObj = {}

                                                                                                        for(let chave in recursosPlaneta.dataValues)
                                                                                                        {
                                                                                                            recursosUpdateObj[chave] = recursosPlaneta.dataValues[chave] + loot[chave]
                                                                                                        }
                                                                                                        models.RecursosPlanetarios.update(recursosUpdateObj, {where : {planetaID : planeta.id}, /*transaction : transacao*/})
                                                                                                            .then(() => {
                                                                                                                transacao.commit()
                                                                                                                resolve()
                                                                                                            })
                                                                                                    })
                                                                                                
                                                                                            })
                                                                                    })
                                                                            }
                                                                            else
                                                                            {
                                                                                transacao.commit()
                                                                                resolve()
                                                                                
                                                                            }
                                                                            
                                                                            
                                                                        })
                                                                
                                                                })
                                                        })
                                                    })

                                        })
                                })
                            })
                        }
                    })
                
            })
        }

        function Fase2()
        {
            models.Operacao_Militar.update({estagio : 2}, {where : {id : operacaoID}})
            return new Promise((resolve) => {  
                GerenciadorCombates.combaterEmSetor(operacaoID, setorDestino.id, () =>{
                    Fase3()
                        .then(() => {
                            resolve()
                        })
                })
                

                
            })
            
        }

        function Fase1()
        {
            let mover = function() {
                return new Promise((resolve, reject) => {
                    MoverFrota(operacao.id, setorAtual, setorAtual, {})
                        .then(() => {
                            rotaIteradorIndex++
                            rotaIterator = rota[rotaIteradorIndex]
                            
                            models.Setor.findOne({where : {posX : rotaIterator.posX, posY : rotaIterator.posY}})
                                .then((setor) => {
                                    console.log(`setorAtual : ${setorAtual.id} | setor : ${setor.id}`)
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
                                        models.Operacao_Militar.update({setorAtual : setorDestino.id}, {where : {operacaoID : operacaoID}})
                                        resolve()
                                    }
                                })

                        });
                    })
                }
            return new Promise((resolve, reject) => {
                mover()
                    .then(() => {
                        Fase2()
                            .then(() => {
                                resolve()
                            })
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

                    rota = pathFinder.encontrarRota({posX : setorAtual.posX, posY : setorAtual.posY}, {posX : setorDestino.posX, posY : setorDestino.posY})
                    rotaIteradorIndex = 0
                    rotaIterator = rota[rotaIteradorIndex]

                    if(operacao.estagio == 1)
                    {
                        if(setorAtual.id != setorDestino.id)
                        {
                            Fase1()  
                                .then(() => {
                                    resolve()
                                })  
                        }
                        else
                        {
                            Fase2()
                                .then(() => {
                                    resolve()
                                })
                        }
                        
                    }
                    else if(operacao.estagio == 2)
                    {
                        Fase2()
                            .then(() => {
                                resolve()
                            })
                    }
                    else if(operacao.estagio == 3)
                    {
                        Fase3()
                            .then(() =>{
                                resolve()
                            })
                    }
                })
        })
    })
}
module.exports = {
    Colonizar : Colonizar,
    Pilhar : Pilhar
}