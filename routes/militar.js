let express = require('express');
let router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
let croner  = require('./../services/Croner')
let pathfinder = require('./../services/Pathfinder')


function getFrota(planetaid, usuarioID)
{
    return new Promise((resolve, reject) => {
        models.Frota.findOne({where : {planetaID : planetaid}})
                .then(frota => {
                    if(frota)
                    {
                        if(frota.usuarioID != usuarioID)
                        {
                            reject(new Error("Planeta inválido"))
                        }
                        else
                        {
                            resolve(frota)
                        }
                    }
                    else
                    {
                        models.Planeta.findOne({where : {id : planetaid}})
                            .then((planeta) => {
                                if(planeta)
                                {
                                    MUtils.GetUsuarioPlaneta(planeta)
                                        .then(usuario =>
                                        {
                                            if(usuario)
                                            {
                                                if(usuario.dataValues.id == usuarioID)
                                                {
                                                    models.Frota.create({planetaID : planetaid, usuarioID : usuarioID})
                                                        .then((criada) => {
                                                            delete criada.usuarioID
                                                            delete criada.planetaID
                                                            delete criada.id
                                                            delete criada.operacaoID
                                                            delete criada.relatorioID
                                                            resolve.json(criada);
                                                        })
                                                }
                                                else
                                                {
                                                    reject(new Error("Frota não encontrada 4"))
                                                }
                                            }
                                            else
                                            {
                                                reject(new Error("Frota não encontrada  3"))
                                            }
                                            
                                        })
                                        .catch(() => {
                                            reject(new Error("Frota não encontrada 2"))
                                        })
                                }
                                else
                                {
                                    reject(new Error("Frota não encontrada 1"))
                                }
                            })
                        
                        
                    }
                })
                .catch(err => {
                    reject(err.message)
                })
    })
}

router.get('/frota', (req, res) => {
    if(req.session.usuario)
    {
        /**
         * @type {{planetaid : number}}
         */
        let params = req.query;
        if(params.planetaid || !isNaN(params.planetaid))
        {
              getFrota(params.planetaid, req.session.usuario.id)
              
                .then(frota =>{
                    delete frota.usuarioID
                    delete frota.planetaID
                    delete frota.id
                    delete frota.operacaoID
                    delete frota.relatorioID
                    res.status(200).json(frota)
                })
                .catch(err => {
                    res.status(500).end(err.message)
                })
        }
        else
        {
            res.status(400).end("Parâmetros precisa conter planetaid como número");
        }
    }
    else
    {
        res.status(403).end("")
    }
})

router.put('/frota', (req, res) => {
    if(req.session.usuario)
    {
        /**
         * @type {{planetaid : number, quantidade: number, unidade: string}}
         */
        let params = req.body;
        if(params.planetaid || !isNaN(params.planetaid) || !params.quantidade || !params.unidade)
        {
            models.Frota.findOne({where : {planetaID : params.planetaid, usuarioID : req.session.usuario.id}})
                .then(frota => {
                    if(frota)
                    {
                        if(frota.usuarioID != req.session.usuario.id)
                        {
                            res.status(403).end("planetaid inválido")
                        }
                        else
                        {

                            croner.AdicionarFrota(req.session.usuario.id, params.planetaid, params.unidade, params.quantidade, 1)
                                .then(() => {
                                    res.status(200).end("")
                                })
                                .catch((err) => {
                                    res.status(500).end(err.message)
                                })
                        }
                    }
                    else
                    {
                        res.status(400).end("Frota não encontrada");
                    }
                })
                .catch(err => {
                    res.status(500).end(err.message)
                })  
        }
        else
        {
            res.status(400).end("Parâmetros precisa conter planetaid (número), quantidade (número) e unidade (string)");
        }
    }
    else
    {
        res.status(403).end("")
    }
})


router.get('/path', (req, res) => 
{
    if(req.session.usuario)
    {
        /**
         * @type {{origemPosX : number, origemPosY : number, destinoPosX : number, destinoPosY : number}}
         */
        let params = req.query;

        if((params.origemPosX && params.origemPosY && params.destinoPosX && params.destinoPosY))
        {
            res.status(200).json(pathfinder.encontrarRota(
                {
                    posX : Number(params.origemPosX),
                    posY : Number(params.origemPosY)
                },
                {
                    posX : Number(params.destinoPosX),
                    posY : Number(params.destinoPosY)
                },
            ))
        }
        else
        {
            res.status(400).end("Parâmetros inválidos")
        }
    }
    else
    {
        res.status(403).end("")
    }
})

router.post('/operacao', (req, res) => {
    if(req.session.usuario)
    {
        let params = req.body
        if(!params.operacao || !params.planetaID || !params.setorDestino)
        {
            res.status(400).end("Parâmetros inválidos")
        }
        else
        {
            getFrota(params.planetaID, req.session.usuario.id)
                .then((frota) => 
                {
                    let frotaID = frota.id
                    delete frota.dataValues.usuarioID
                    delete frota.dataValues.planetaID
                    delete frota.dataValues.id
                    delete frota.dataValues.operacaoID
                    delete frota.dataValues.relatorioID
                    let frotaOperacao = {}
                    for(let chave in frota.dataValues)
                    {
                        if(params[chave] != null && frota.dataValues[chave] >= params[chave])
                        {
                            if(params[chave] == '')
                            {
                                params[chave] = 0
                            }
                            else
                            {
                                params[chave] = Number(params[chave])
                            }
                            frotaOperacao[chave] = params[chave]
                        }
                        else
                        {
                            res.status(400).end("Frota inválida")
                            return
                        }
                        
                    }
                    croner.IniciarOperacao(req.session.usuario.id, params.operacao, frotaID, frotaOperacao, params.planetaID, params.setorDestino);
                    res.status(200).end();

                })
                .catch((err) => {
                    res.status(500).end(err.message)
                })
        }
    }
    else
    {
        res.status(403).end("Sem permição")
    }
})


router.get('/operacao', (req, res) => {
    if(req.session.usuario)
    {
        models.Operacao_Militar.findAll({where: {usuarioID : req.session.usuario.id}})
            .then(operacoes => {
                let promessas = []
                for(let i = 0; i < operacoes.length; i++)
                {
                    promessas.push(new Promise((resolve, reject) => {
                        let op = operacoes[i]
                        models.RecursosPlanetarios.findOne({where : {operacaoID : op.id},
                            attributes : 
                            [
                               ['recursoFerro', "ferro"], 
                               ['recursoCristal', "cristal"],
                               ['recursoComponente', "componente"],
                               ['recursoTitanio', "titanio"]
                            ]})
                            .then(recursos => {
                                models.Frota.findOne({where : {operacaoID : op.id}})
                                    .then(frota => {
                                        if(frota)
                                        {
                                            delete frota.dataValues.id
                                            delete frota.dataValues.planetaID
                                            delete frota.dataValues.usuarioID
                                            delete frota.dataValues.operacaoID
                                            delete frota.dataValues.relatorioID
                                            op.dataValues['frota'] = frota.dataValues
                                        }
                                        else
                                        {
                                            op.dataValues['frota'] = {}
                                        }
                                        if(recursos)
                                        {
                                            op.dataValues['recursos'] = recursos.dataValues
                                        }
                                        else
                                        {
                                            op.dataValues['recursos'] = {}
                                        }
                                        let promessasSetores = []
                                        promessasSetores.push(new Promise(resolve => {
                                            models.Setor.findOne({where : {id : op.origem}, attributes : ['nome']})
                                                .then(origem => {
                                                    op.dataValues['nomeOrigem'] = origem.nome
                                                    resolve()
                                                })
                                        }))
                                        
                                        promessasSetores.push(new Promise(resolve => {
                                            models.Setor.findOne({where : {id : op.destino}, attributes : ['nome']})
                                                .then(destino => {
                                                    op.dataValues['nomeDestino'] = destino.nome
                                                    resolve()
                                                })
                                        }))

                                        promessasSetores.push(new Promise(resolve => {
                                            models.Setor.findOne({where : {id : op.atual}, attributes : ['nome']})
                                                .then(atual => {
                                                    op.dataValues['nomeAtual'] = atual.nome
                                                    resolve()
                                                })
                                        }))
                                        Promise.all(promessasSetores)
                                            .then(() => {
                                                resolve(op)
                                            })
                                        
                                    })
                            })
                    }))
                }

                Promise.all(promessas)
                    .then(ops => {
                        res.status(200).json(ops)
                    })
                    .catch(err => {
                        res.status(500).end(err.message)
                    })
            })
            .catch(err => {
                res.status(500).json(err)
            })
    }
    else
    {
        res.status(403).end("Sem permição")
    }
})


router.get('/frota-construcoes', (req, res) => {
    if(req.session.usuario)
    {
        let params = req.query
        if(!params.planetaID)
        {  
            res.status(400).end("Parâmetros inválidos")
        }
        else
        {
            models.Frota_Construcao.findAll({where : {planetaID : params.planetaID}})
                .then(construcoes => {
                    res.status(200).json(construcoes)
                })
        }
    }
    else
    {
        res.status(403).end("Sem permição")
    }
})
module.exports = router;
