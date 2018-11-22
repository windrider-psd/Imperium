const models = require('./../model/DBModels');
const Bluebird = require('bluebird')
const edificioBuiler = require('./../prefabs/EdificioBuilder')
const edificioPrefab = require('./../prefabs/Edificio')
const navePrefab = require('./../prefabs/Nave')
const naveBuilder = require('./../prefabs/NaveBuilder')
const pathFinder = require('./../services/Pathfinder')
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
                return new Promise((resolve, reject) => {
                    MoverFrota(operacao.id, setorAtual, setorOrigem, {})
                        .then(() => {

                            rotaIteradorIndex--
                            rotaIterator = rota[rotaIteradorIndex]
                            models.Setor.findOne({where : {posX : rotaIterator.posX, posY : rotaIterator.posY}})
                                .then((setor) => {
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
            return new Promise((resolve, reject) => {
                models.Operacao_Militar.update({estagio : 3}, {where : {id : operacaoID}})
                mover()
                    .then(() => {

                        models.Planeta.findOne({where : {setor : setorOrigem.id, colonizado : true}})
                            .then(planeta => {
                                if(planeta)
                                {
                                    models.Frota.findOne({where : {id : operacaoID}})
                                        .then(frotaOP => {
                                            delete frotaOP.dataValues.usuarioID
                                            delete frotaOP.dataValues.planetaID
                                            delete frotaOP.dataValues.id
                                            delete frotaOP.dataValues.operacaoID
                                            delete frotaOP.dataValues.relatorioID

                                            models.Frota.findOne({where : {planetaID : planeta.id}})
                                                .then(frotaPlaneta => {
                                                    let frotaUpdateObj = {}
                                                    for(let chave in frotaOP.dataValues)
                                                    {
                                                        frotaUpdateObj[chave] = frotaPlaneta.dataValues[chave] + frotaOP.dataValues[chave]
                                                    }

                                                    models.Frota.update(frotaUpdateObj, {where : {planetaID : planeta.id}})
                                                        .then(() => {
                                                            resolve()
                                                        })
                                                })
                                            models.Frota.findOne({where : {}})
                                            models.Frota.update({})
                                        })
                                }
                                else
                                {
                                    resolve()
                                }
                                
                                
                            })
                       
                    }) 
            })
        }

        function Fase2()
        {
            return new Promise((resolve, reject) => {
                models.Operacao_Militar.update({estagio : 2}, {where : {id : operacaoID}})
                models.Frota.findOne({where : {operacaoID : operacaoID}})
                .then(frotaOP => {

                    delete frotaOP.dataValues.usuarioID
                    delete frotaOP.dataValues.planetaID
                    delete frotaOP.dataValues.id
                    delete frotaOP.dataValues.operacaoID
                    delete frotaOP.dataValues.relatorioID

                    models.Planeta.findAll({where : {setorID : setorDestino.id}})
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
                                            console.log(frota.dataValues)
                                            
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
                                                                        Fase3()
                                                                            .then(() => {
                                                                                resolve()
                                                                            })
                                                                    })
                                                            }
                                                        })
                                                })
                                                .catch(err => {


                                                    console.log(err)
                                                })
                                        })

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
                        }
                        else
                        {
                            Fase2()
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