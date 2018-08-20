var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const sanitizer = require("sanitizer")
const io = require('./../model/io')
var Bluebird = require('bluebird');
const formatoSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ //Sem espaço
const formatoSpecial2 = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ //Com espaço

require('dotenv/config')

/**
 * 
 * @param {number} aliancaID O id da aliança
 * @description Retorna todas as aplicações de uma aliança com o nome dos usuários aplicados
 * @returns {Bluebird.<Object>}
 */
function getAplicacoes(aliancaID)
{
    return new Bluebird(resolve => {
        models.Alianca_Aplicacao.findAll({where : {aliancaID : aliancaID}}).then(aplicacoes => {
            let promessasAll = new Array();
            let usuariosids = new Array();
            for(let i = 0; i < aplicacoes.length; i++)
            {
                let esta = false;
                for(let j = 0; j < usuariosids.length; j++)
                {
                    if(aplicacoes[i].usuarioID == usuariosids[j])
                    {
                        esta = true;
                        break;
                    }
                }
                if(!esta)
                {
                    usuariosids.push(aplicacoes[i].usuarioID);
                    promessasAll.push(new Bluebird(resolve => {
                        let appalvo = aplicacoes[i];
                        models.Usuario.findOne({where : {id :  appalvo.usuarioID}, attributes : ['id', 'nick']}).then(usuario => resolve(usuario))
                    }))
                }
            }

            Bluebird.all(promessasAll).then(usuarios => {
                for(let i = 0; i < aplicacoes.length; i++)
                {
                    for(let j = 0; j < usuarios.length; j++)
                    {
                        if(aplicacoes[i].usuarioID == usuarios[j].id)
                        {
                            aplicacoes[i].dataValues.usuario = usuarios[j]
                            break;
                        }
                    }
                }
                resolve(aplicacoes)
            })
            
        })
    })
}


/**
 * 
 * @param {number} usuario O id do usuário
 * @param {number} alianca O id da aliança
 * @param {boolean} aceito Verdadeiro se ele for aceito, senão, falso
 * @description Aceita ou rejeita um usuário a uma aliança
 * @returns {Bluebird<void>}
 */
function setAceitacaoAplicacao(usuario, alianca, aceito)
{
    return new Bluebird((resolve, reject) => {

        models.Con.transaction().then(transacao => {
            if(aceito)
            {
                models.Usuario_Participa_Alianca.create({usuarioID : usuario, aliancaID : alianca}, {transaction : transacao}).then(() => {
                    models.Alianca_Aplicacao.destroy({where : {usuarioID : usuario}, transaction : transacao}).then(() => {
                        transacao.commit().then(() => resolve(true));
                    })
                }).catch(err => {
                    transacao.rollback()
                    reject(err)
                })
            }
            else
            {
                models.Alianca_Aplicacao.destroy({where : {usuarioID : usuario}, transaction : transacao}).then(() => {
                    transacao.commit().then(() => resolve(true));
                }).catch(err => {
                    transacao.rollback()
                    reject(err)
                })
            }
        }).catch(err => reject(err))
    })
}

router.post('/criar-alianca', (req, res) =>
{
    /**
     * @type {{nome : string, tag : string}}
     */
    let params = req.body;
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.nome || !params.tag)
        res.status(400).end("Parâmetros inválidos")
    else if(formatoSpecial.test(params.nome) || formatoSpecial2.test(params.tag))
        res.status(400).end("O nome da aliança não pode conter caractéres especiais")
    else
    {
        models.Usuario_Participa_Alianca.count({where : {usuarioID : req.session.usuario.id}}).then(contagem =>{
            if(contagem != 0)
                res.status(400).end("Você precisa sair da sua aliança atual para criar uma")
            else
            {
                let nome = sanitizer.escape(params.nome)
                models.Alianca.count({where : {$or : {nome : nome, tag : params.tag}}}).then(contagem =>
                {
                    if(contagem != 0)
                        res.status(400).end("Já existe outra aliança com este nome ou tag")
                    else
                    {
                        models.Con.transaction().then(transacao => {
                            models.Alianca.create({nome : nome, lider : req.session.usuario.id, tag : params.tag}, {transaction : transacao}).then((alianca) => {
                                models.Usuario_Participa_Alianca.create({usuarioID : req.session.usuario.id, aliancaID : alianca.id, rank : null}, {transaction : transacao}).then(() =>
                                    models.Alianca_Aplicacao.destroy({where : {usuarioID : req.session.usuario.id}, transaction : transacao}).then(() => transacao.commit().then(() => res.status(200).end("Aliança criada")))
                                );
                            }).catch(() =>
                            {
                                transacao.rollback();
                                res.status(500).end("Houve um erro ao criar a aliança")
                            })
                        }).catch(() => res.status(500).end("Houve um erro ao criar a aliança"))        
                    }
                })       
            }
        })
    }
})

router.post('/sair-alianca', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        models.Usuario_Participa_Alianca.findOne({where: {usuarioID : req.session.usuario.id}}).then(participa =>{
            if(!participa)
                res.status(400).end("Você participa de nenhuma aliança");
            else
            {
                models.Alianca.findOne({where : {id : participa.aliancaID}}).then(alianca => {
                    models.Con.transaction().then(transacao => {
                        models.Usuario_Participa_Alianca.destroy({where : {usuarioID : req.session.usuario.id}, transaction : transacao}).then(() =>{
                            if(alianca.lider == req.session.usuario.id)
                            {
                                if(alianca.sucessor == null) //Se a aliança não tiver sucessor
                                {
                                    models.Usuario_Participa_Alianca.findAll({where : {
                                    aliancaID : alianca.id, 
                                    usuarioID : {$not : req.session.usuario.id}}, limit : 1, transaction : transacao})
                                    .then(participantes => {
                                        if(participantes.length == 0)
                                            models.Alianca.destroy({where : {id : alianca.id}, transaction : transacao}).then(() => transacao.commit().then(() =>res.status(200).end("Saída realizada com sucesso")))
                                        else
                                        {
                                            models.Alianca.update({lider : participantes[0].usuarioID, sucessor : null}, {where : {id : alianca.id}, transaction : transacao}).then(() => {
                                                models.Usuario_Participa_Alianca.destroy({where : {usuarioID: req.session.usuario.id}, transaction : transacao}).then(() => transacao.commit().then(() => res.status(200).end("Saída realizada com sucesso")))
                                            }) 
                                        }
                                            
                                    })
                                }
                                else
                                {
                                    models.Alianca.update({lider : alianca.sucessor, sucessor : null}, {where : {id: alianca.id}, transaction : transacao}).then(() => {
                                        models.Usuario_Participa_Alianca.destroy({where : {usuarioID: req.session.usuario.id}, transaction : transacao}).then(() => transacao.commit().then(() => res.status(200).end("Saída realizada com sucesso")))
                                    });   
                                }
                                    
                                        
                            }
                            else
                                transacao.commit().then(() =>res.status(200).end("Saída realizada com sucesso"))
                        }).catch(() => {res.status(500).end("Houve um erro ao sair da aliança"); transacao.rollback() })
                    }).catch(() => res.status(500).end("Houve um erro ao sair da aliança"))
                })
            }
        })
    }
})


router.post('/aplicar-alianca', (req, res) => {
    /**
     * @type {{alianca : number, aplicacao : string}}
     */    
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.alianca || !params.aplicacao)
        res.status(400).end("Parâmetros inválidos")
    else if(isNaN(params.alianca))
        res.status(400).end("Parâmetros inválidos")
    else
       models.Alianca_Aplicacao.create({usuarioID : req.session.usuario.id, aliancaID: params.alianca, texto : sanitizer.escape(params.aplicacao)}).then(() => res.status(200).end("Aplicação enviada com sucesso")).catch(() => res.status(500).end("Houve um erro interno"))
})

router.post('/cancelar-aplicacao', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
        models.Alianca_Aplicacao.destroy({where : {usuarioID : req.session.usuario.id}}).then(() => res.status(200).end("Aplicação cancelada com sucesso")).catch(() => res.status(500).end("Houve um erro am remover a aplicação"))
})




router.get('/getAplicacoes', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        models.Usuario_Participa_Alianca.findOne({where : {usuarioID : req.session.usuario.id}}).then(participa => {
            if(!participa)
                res.status(400).end("É necessário participar de uma aliança")
            else
            {
                if(participa.rank == null)
                {
                    models.Alianca.findOne({where : {id : participa.aliancaID}, attributes : ['id', 'lider']}).then(alianca => {
                        if(alianca.lider != req.session.usuario.id)
                            res.status(403).end("Operação inválida")
                        else
                            getAplicacoes(participa.aliancaID).then(aplicacoes => res.status(200).json(aplicacoes)).catch(() => res.status(500).end("Houve um erro no servidor"))
                    })
                }
                else
                {
                    models.Alianca_Rank.findOne({where : {id : participa.rank}, attributes : ['id', 'ver_aplicacoes']}).then(rank => {
                        if(rank.ver_aplicacoes === true)
                            getAplicacoes(participa.aliancaID).then(aplicacoes => res.status(200).json(aplicacoes)).catch(() => res.status(500).end("Houve um erro no servidor"))
                        else
                            res.status(403).end("Operação inválida")
                    })
                }
                    
            }
        })
    }
})

router.post('/aceitar-aplicacao', (req, res) => {
    /**
     * @type {{usuario : number, valor : string}}
     */    
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.usuario || !params.valor)
        res.status(400).end("Parâmetros inválidos")
    else if(isNaN(params.usuario))
        res.status(400).end("Parâmetros inválidos")
    else
    {
        params.valor = params.valor == "1" || params.valor == "true"

        models.Alianca_Aplicacao.findOne({where : {usuarioID : params.usuario}}).then(aplicacao => {
            if(!aplicacao)
                res.status(400).end("Aplicação não encontrada")
            else
            {
                models.Usuario_Participa_Alianca.findOne({where : {usuarioID : req.session.usuario.id}}).then(participa => {
                    if(!participa)
                        res.status(403).end("Operação inválida")
                    else if(participa.aliancaID != aplicacao.aliancaID)
                        res.status(403).end("Operação inválida")
                    else
                    {
                        if(participa.rank == null)
                        {
                            models.Alianca.findOne({where : {id : participa.aliancaID}, attributes : ['id', 'lider']}).then(alianca => {
                                if(alianca.lider != req.session.usuario.id)
                                    res.status(403).end("Operação inválida")
                                else
                                    setAceitacaoAplicacao(aplicacao.usuarioID, aplicacao.aliancaID, params.valor).then(() => res.status(200).end("Aplicação tratada com sucesso")).catch(() => res.status(500).end("Houve um erro no servidor"))
                            })
                        }
                        else
                        {
                            models.Alianca_Rank.findOne({where : {id : participa.rank}, attributes : ['id', 'aceitar_aplicacoes']}).then(rank => {
                                if(rank.aceitar_aplicacoes === true)
                                    setAceitacaoAplicacao(aplicacao.usuarioID, aplicacao.aliancaID, params.valor).then(() => res.status(200).end("Aplicação tratada com sucesso")).catch(() => res.status(500).end("Houve um erro no servidor"))
                                else
                                    res.status(403).end("Operação inválida")
                            })
                        }
                            
                    }
                })
            }
        })
    }
})

router.get('/getMembros', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        let permicoes = new Bluebird((resolve, reject) => {
            models.Usuario_Participa_Alianca.findOne({where : {usuarioID : req.session.usuario.id}}).then(participa => {
                if(!participa)
                    reject("É necessário participar de uma aliança")
                else
                {
                    if(participa.rank == null)
                    {
                        models.Alianca.findOne({where : {id : participa.aliancaID}, attributes : ['id', 'lider']}).then(alianca => {
                            resolve({participa : participa, online : alianca.lider != req.session.usuario.id})
                        })
                    }
                    else
                        models.Alianca_Rank.findOne({where : {id : participa.rank}, attributes : ['id', 'ver_aplicacoes']}).then(rank => resolve({participa : participa, online: rank.online}))
                }
            })
        })

        permicoes.then(permicao => {
            let participa = permicao.participa
            models.Usuario_Participa_Alianca.findAll({where : {aliancaID : participa.aliancaID}, attributes: ['usuarioID', 'rank']}).then(participacoes => {
                let promessasAll = new Array();
                for(let i = 0; i < participacoes.length; i++)
                {
                    promessasAll.push(new Bluebird(resolve => {
                        let participap = participacoes[i];
                        let promossasParticipa = new Array();
                        
                        promossasParticipa.push(new Bluebird(resolvep => {
                            models.Usuario.findOne({where : {id : participap.usuarioID}, attributes : ['id', 'nick', 'ferias', 'banido', 'pontosPesquisa', 'pontosMilitar', 'pontosEconomia']}).then(usuario => resolvep(usuario.dataValues))
                        }))
                        promossasParticipa.push(new Bluebird(resolvep => {
                            if(participap.rank == null)
                                resolvep(null)
                            else
                                models.Alianca_Rank.findOne({where : {id : participap.rank}, attributes : ['id', 'nome']}).then(rank => resolvep(rank))
                        }))
                        Bluebird.all(promossasParticipa).then(resultado => {
                            resolve(resultado);
                        })
                    }))
                }

                Bluebird.all(promessasAll).then(resultado => { //Array de [usuario, rank]
                    let retorno = new Array();
                    for(let i = 0; i < resultado.length; i++)
                    {
                        let respush = {usuario : resultado[i][0], rank : resultado[i][1]};
                        if(permicao.online)
                            respush.online = io.isOnline(resultado[i][0].id)
                        retorno.push(respush)
                    }
                        
                    
                    res.status(200).json(retorno)
                })
            })
        }).catch(err => res.status(403).end(err.toString()))
    }
})

module.exports = router;
