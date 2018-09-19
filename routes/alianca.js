var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const sanitizer = require("sanitizer")
const io = require('./../model/io')
const ranking = require('./../services/Ranking')
const Bluebird = require('bluebird');
const formatoSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ //Sem espaço
const formatoSpecial2 = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ //Com espaço
require('dotenv/config')


function getMembros(aliancaID)
{
    return new Bluebird((resolvem, reject) => {
        models.Usuario_Participa_Alianca.findAll({where : {aliancaID : aliancaID}, attributes: ['usuarioID', 'rank']}).then(participacoes => {
            let promessasAll = new Array();
            for(let i = 0; i < participacoes.length; i++)
            {
                promessasAll.push(new Bluebird(resolve => {
                    let participap = participacoes[i];
                    let promossasParticipa = new Array();
                    promossasParticipa.push(new Bluebird(resolvep => {
                        models.Usuario.findOne({where : {id : participap.usuarioID}, attributes : ['id', 'nick', 'ferias', 'banido']}).then(usuario => {
                            ranking.GetRankingUsuario(usuario.id).then(rankusuario => {
                                usuario.dataValues.rank = rankusuario
                                resolvep(usuario.dataValues)
                            })
                        })
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
            Bluebird.all(promessasAll).then(resultado => {
                resolvem(resultado)
            })
        })
    })
}


/**
 * @param {Express.Request} req Requisição http (http.IncomingMessage)
 * @returns {Bluebird.<Object>}
 */
function getParticipacao(req)
{
    return new Bluebird((resolve, reject) => {
        if(!req.session.usuario)
            reject(new Error("Usuário não encontrado"))
        else
        {
            models.Usuario_Participa_Alianca.findOne({where : {usuarioID : req.session.usuario.id}}).then(participa => {
                if(!participa)
                    reject(new Error("Sem aliança"))
                else
                {
                    models.Alianca.findOne({where : {id : participa.aliancaID}, attributes : ['id', 'lider']}).then(alianca =>
                    {
                        let retorno = participa.dataValues;
                        if(participa.rank == null)
                        {
                            retorno.rank = {lider : alianca.lider == req.session.usuario.id}
                            resolve(retorno)
                        }
                        else
                        {
                            models.Alianca_Rank.findOne({where : {id : participa.rank}}).then(rank => {
                                rank.dataValues.lider = alianca.lider == req.session.usuario.id
                                retorno.rank = rank.dataValues
                                resolve(retorno)
                            })
                        }
                    })
                }
            })
        }
    })
}


/** 
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
                    models.Alianca_Convite.destroy({where : {usuarioID : usuario}, transaction : transacao}).then(() => {
                        models.Alianca_Aplicacao.destroy({where : {usuarioID : usuario}, transaction : transacao}).then(() => {
                            transacao.commit().then(() => resolve(true));
                        })
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
                                    models.Alianca_Aplicacao.destroy({where : {usuarioID : req.session.usuario.id}, transaction : transacao})
                                        .then(() => {
                                            models.Alianca_Convite.destroy({where : {usuarioID : req.session.usuario.id}})
                                                .then(() => 
                                                    transacao.commit().then(() => res.status(200).end("Aliança criada")))
                                        })
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

        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.ver_aplicacoes)
                getAplicacoes(participacao.aliancaID).then(aplicacoes => res.status(200).json(aplicacoes)).catch(() => res.status(500).end("Houve um erro no servidor"))
            else
                res.status(400).end("Operação inválida")
        }).catch(err => res.status(400).end(err.toString()))
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

        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.aceitar_aplicacoes)
            {
                models.Alianca_Aplicacao.findOne({where : {usuarioID : params.usuario, aliancaID : participacao.aliancaID}}).then(aplicacao => {
                    if(!aplicacao)
                        res.status(400).end("Aplicação não encontrada")
                    else
                        setAceitacaoAplicacao(aplicacao.usuarioID, aplicacao.aliancaID, params.valor).then(() => res.status(200).end("Aplicação tratada com sucesso")).catch(() => res.status(500).end("Houve um erro no servidor"))
                })
            }
            else
                res.status(400).end("Operação inválida")
        }).catch(err => res.status(400).end(err.toString()))
    }
})

router.get('/getMembros', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        getParticipacao(req).then(participacao => {
            let permicao = participacao.rank
            getMembros(participacao.aliancaID).then((resultado) => { //Array de [usuario, rank]
                let retorno = {resultado : new Array()}
                for(let i = 0; i < resultado.length; i++)
                {
                    let respush = {usuario : resultado[i][0], rank : resultado[i][1]};
                    if(permicao.lider || permicao.online)
                        respush.online = io.isOnline(resultado[i][0].id)
                    retorno.resultado.push(respush)
                }
                if(permicao.lider || permicao.ranks_atribuir)
                {
                    models.Alianca_Rank.findAll({where : {aliancaID: participacao.aliancaID}, attributes : ['id', 'nome']}).then(ranks_alianca => {
                        retorno.ranks = ranks_alianca
                        res.status(200).json(retorno)
                    })
                }
                else
                    res.status(200).json(retorno)
            })
        }) 
    }
})

router.get('/getAdministracao', (req, res) =>{
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        getParticipacao(req).then(participacao => {
            let adminPromessas = new Array(); //[rank, membros]
            adminPromessas.push(new Bluebird(resolve => {
                if(participacao.rank.lider == true || participacao.rank.ranks_criar == true)
                    models.Alianca_Rank.findAll({where : {aliancaID : participacao.aliancaID}}).then(ranks => resolve(ranks))
                else
                    resolve(null)
            }))

            adminPromessas.push(new Bluebird((resolve, reject) => {
                if(participacao.rank.lider == true)
                {
                    getMembros(participacao.aliancaID).then(resultado => { //Array de [usuario, rank]
                        let retorno = new Array()
                        for(let i = 0; i < resultado.length; i++)
                            retorno.push({usuario : resultado[i][0], rank : resultado[i][1]})
                        resolve(retorno)
                    })
                }
            }))
            Bluebird.all(adminPromessas).then(resultado => res.status(200).json(resultado))
            
                
        }).catch(err => res.status(400).end(err.toString()))
        
    }
})

router.post("/salvar-cargos", (req, res) => {
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.dados)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        params.dados = JSON.parse(params.dados)

        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.ranks_atribuir)
            {
                models.Con.transaction().then(transacao => {
                    let promessas = new Array();
                    for(let i = 0; i < params.dados.length; i++)
                    {
                        promessas.push(new Bluebird((resolve, reject) => {
                            params.dados[i].nome = sanitizer.escape(params.dados[i].nome)
                            models.Alianca_Rank.update(params.dados[i], {where : {id : params.dados[i].id}, transaction : transacao}).then(() => resolve()).catch(() => reject())
                        })) 
                    }
                    Bluebird.all(promessas).then(()=> 
                        transacao.commit().then(() => res.status(200).end("Cargos salvos com sucesso"))
                    ).catch(()=> {
                        transacao.rollback()
                        res.status(500).end("Erro ao salvar os cargos")
                    })
                })
            }
            else
                res.status(403).end("Sem permições")
        }).catch(err => res.status(400).end(err.toString()))
    }
})

router.post('/criar-cargo', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.ranks_criar)
            {
                models.Alianca_Rank.count({where : {aliancaID : participacao.aliancaID}}).then(contagem => {
                    let nome = "Cargo " + String(contagem + 1)
                    models.Alianca_Rank.create({aliancaID : participacao.aliancaID, nome : nome}).then(criado => res.status(200).json(criado.dataValues))
                }).catch(() => {res.status(500).end("Erro ao criar cargo")})
            }
            else
                res.status(403).end("Sem permições")
        }).catch(err => res.status(400).end(err.toString()))
    }
})

router.post('/excluir-cargo', (req, res) => {
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.id)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.ranks_criar)
                models.Alianca_Rank.destroy({where : {id : params.id, aliancaID : participacao.aliancaID}}).then(() => res.status(200).end("Cargo excluido com sucesso"))
            else
                res.status(403).end("Sem permições")
        }).catch(err => res.status(400).end(err.toString()))
    }
})


router.post('/atribuir-cargo', (req, res) => {
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.id)
        res.status(400).end("Parâmetros inválidos")
    else if(!params.id == req.session.usuario.id)
        res.status(400).end("Operaçã inválida")
    else
    {
        getParticipacao(req).then(participacao => {
            
            if(participacao.rank.lider || participacao.rank.ranks_atribuir)
            {
                models.Alianca.findOne({where : {id : participacao.aliancaID}}).then(alianca => {
                    if(alianca.lider == params.id)
                        res.status(403).end("Operaçã inválida")
                    else if(params.cargo == 'null')
                    {
                        models.Usuario_Participa_Alianca.update({rank : null}, {where : {usuarioID : params.id}}).then(() => res.status(200).end("Cargo atualizado")).catch(() => res.status(500).end("Erro ao atualizar o cargo"))
                    }
                    else
                    {
                        models.Alianca_Rank.findOne({where : {id : params.cargo, aliancaID: participacao.aliancaID}}).then(rank => {
                            if(!rank)
                                res.status(400).end("Operação inválida")
                            else
                                models.Usuario_Participa_Alianca.update({rank : params.cargo}, {where : {usuarioID : params.id}}).then(() => res.status(200).end("Cargo atualizado")).catch(() => res.status(500).end("Erro ao atualizar o cargo"))
                        })
                    }
                })
            }
               
            else
                res.status(403).end("Sem permições")
        }).catch(err => res.status(400).end(err.toString()))
    }
})



router.post('/expulsar-membro', (req, res) => {
    /**
     * @type {{id : number}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.id)
        res.status(400).end("Parâmetros inválidos")
    else if(!params.id == req.session.usuario.id)
        res.status(400).end("Operaçã inválida")
    else
    {
        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.expulsar)
            {
                models.Alianca.findOne({where : {id : participacao.aliancaID}}).then(alianca => {
                    if(alianca.lider == params.id)
                        res.status(403).end("Operaçã inválida")
                    else
                        models.Usuario_Participa_Alianca.destroy({where :{usuarioID : params.id, aliancaID : alianca.id}}).then(()  => res.status(200).end("Membro expulso")).catch(() => res.status(500).end('Houve um erro ao expulsar o jogador'))
                })
            }
            else
                res.status(403).end("Sem permições")
        }).catch(err => res.status(400).end(err.toString()))
    }
})

router.post('/set-pagina-externa', (req, res) => {
    /**
     * @type {{bbcode : string}}
     */
    
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(typeof(params.bbcode) == 'undefined')
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.paginaExterna)
            {

                models.Alianca.update({paginaExterna : sanitizer.escape(params.bbcode)}, {where : {id : participacao.aliancaID}})
                .then(() => 
                    res.status(200).end("Página externa salva com sucesso")
                )
                .catch(err => 
                    res.status(500).end(err.message)
                )
            }
            else
                res.status(403).end("Sem permições")
        })
        .catch(err => 
            res.status(400).end(err.message))
    }
})


router.post('/set-pagina-interna', (req, res) => {
    /**
     * @type {{bbcode : string}}
     */
    
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(typeof(params.bbcode) == 'undefined')
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.paginaInterna)
            {
                models.Alianca.update({paginaInterna : sanitizer.escape(params.bbcode)}, {where : {id : participacao.aliancaID}})
                .then(() => 
                    res.status(200).end("Página externa salva com sucesso")
                )
                .catch(err => 
                    res.status(500).end(err.message)
                )
            }
            else
                res.status(403).end("Sem permições")
        })
        .catch(err => 
            res.status(400).end(err.message))
    }
})

router.post('/enviar-convite', (req, res) => {
    /**
    * @type {{destinatario: number, mensagem : string}}
    */
    let params = req.body;
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.destinatario || !params.mensagem)
        res.status(400).end("Parâmetros inválidos")
    else if(isNaN(params.destinatario))
        res.status(400).end("Parâmetros inválidos")
    else if(params.destinatario == req.session.usuario.id || params.mensagem == '')
        res.status(400).end("Parâmetros inválidos")
    else if(params.mensagem.length > Number(process.env.MESSAGE_CONTENT_MAX_LENGTH))
        res.status(400).end("Mensagem muito longa")
    else
    {
        getParticipacao(req).then(participacao => {
            if(participacao.rank.lider || participacao.rank.convidar)
            {
                models.Usuario_Participa_Alianca.findOne({where : {usuarioID : params.destinatario}})
                    .then(destinatario_participa => {
                        if(!destinatario_participa)
                        {
                            models.Con.transaction()
                                .then(transacao => {
                                    models.Alianca_Convite.destroy({where: {usuarioID : Number(params.destinatario)}, transaction : transacao})
                                        .then(() => {
                                            models.Alianca_Convite.create({usuarioID : Number(params.destinatario), aliancaID : participacao.aliancaID, mensagem : sanitizer.escape(params.mensagem)}, {transaction : transacao})
                                                .then(() => {
                                                    transacao.commit().then(() => res.status(200).end("Convite enviado com sucesso"))
                                                }).catch((err) => {
                                                    transacao.rollback()
                                                    res.status(500).end(err.message)
                                                })
                                        })
                                        .catch((err) => {
                                            transacao.rollback()
                                            res.status(500).end(err.message)
                                        })
                                })
                                .catch(err => res.status(500).end(err.message))
                        }
                        else
                            res.status(400).end("Destinatário inválido")
                    })
                    .catch((err) => 
                        res.status(500).end(err.message)    
                    )
            }
            else
                res.status(403).end("Sem permições")
        })
        .catch(err => 
            res.status(400).end(err.message))
    }
})


router.get('/getConvites', (req, res) => {
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        models.Alianca_Convite.findAll({where : {usuarioID : req.session.usuario.id}})
            .then(convites => {
                /**
                 * @type {Array.<Bluebird<{aliancaID : number, aliancaNome : string, aliancaTag : string, mensagem : string}>>}
                 */
                let promessas = new Array();

                for(let i = 0; i < convites.length; i++)
                {
                    promessas.push(new Bluebird((resolve, reject) => {
                        let convite = convites[i];
                        models.Alianca.findOne({where :{id : convite.aliancaID}, attributes : ['nome', 'tag']})
                            .then(alianca => {
                                resolve({aliancaID : convite.aliancaID, aliancaNome : alianca.nome, aliancaTag : alianca.tag, mensagem : convite.mensagem});
                            })
                            .catch(err => 
                                reject(err)
                            )
                    }))
                
                }
                Bluebird.all(promessas)
                    .then(resultado =>
                        res.status(200).json(resultado)
                    )
                    .catch(err =>
                        res.status(500).end(err.message)
                    )
            })
            .catch(err =>
                res.status(500).end(err.message)
            )
    }
})


router.post('/aceitar-convite', (req, res) => {
    /**
    * @type {{valor: number, aliancaID : number}}
    */
    let params = req.body;
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.valor || !params.aliancaID)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        models.Usuario_Participa_Alianca.findOne({where : {usuarioID : req.session.usuario.id}, attributes : ['usuarioID']})
            .then(participacao =>{
                if(participacao)
                    res.status(400).end("Não pode participar de uma aliança")
                else
                {
                    models.Alianca_Convite.findOne({where : {usuarioID : req.session.usuario.id, aliancaID : params.aliancaID}})
                        .then(convite => {
                            if(convite)
                            {
                                models.Con.transaction()
                                    .then(transacao => {
                                        if(params.valor == 1) //Aceitar convite
                                            models.Alianca_Convite.destroy({where : {usuarioID : req.session.usuario.id}, transaction : transacao})
                                                .then(() => {
                                                    models.Usuario_Participa_Alianca.create({usuarioID : req.session.usuario.id, aliancaID : params.aliancaID}, {transaction : transacao})
                                                        .then(() => {
                                                            models.Alianca_Aplicacao.destroy({where : {usuarioID : req.session.usuario.id}, transaction : transacao})
                                                                .then(() => {
                                                                    transacao.commit().then(() => res.status(200).end("Convite aceito"))
                                                                })
                                                        })
                                                })
                                                .catch(err => {
                                                    transacao.rollback();
                                                    res.status(500).end(err.message)
                                                })
                                        else //Recusar convite
                                        {
                                            models.Alianca_Convite.destroy({where : {usuarioID : req.session.usuario.id, aliancaID : params.aliancaID}, transaction : transacao})
                                                .then(() => {
                                                    transacao.commit().then(() => res.status(200).end("Convite recusado"))
                                                })
                                                .catch(err => {
                                                    transacao.rollback()
                                                    res.status(500).end(err.message)
                                                })
                                        }
                                    })
                            }
                            else
                                res.status(400).end("Convite não existe")
                        })
                }
            })
            .catch(err => 
                res.status(500).end(err.message)
            )
    }
})



router.post('/excluir-alianca', (req, res) => 
{
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider)
                {
                    models.Alianca.destroy({where : {id : participacao.aliancaID}})
                        .then(() => {
                            res.status(200).end("Aliança excluida")
                        })
                        .catch(err => {
                            res.status(500).end(err.message)
                        })
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err => 
                res.status(403).end(err.message)
            )
    }
})

router.post('/renomear-alianca', (req, res) => {
    /**
     * @type {{nome : string, tag : string}}
     */
    let params = req.body;
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.nome || !params.tag)
        res.status(400).end("Parâmetros inválidos")
    else if(formatoSpecial.test(params.nome) || formatoSpecial2.test(params.tag))
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider)
                {
                    models.Alianca.findOne({
                    where : 
                    {
                        id : {$not : participacao.aliancaID},
                        $or :{
                            nome : params.nome,
                            tag : params.tag
                        }
                    },
                    attributes : ['nome', 'tag']
                    })
                        .then(alianca => {
                            if(!alianca)
                            {
                                models.Alianca.update({nome : params.nome, tag : params.tag},{where : {id : participacao.aliancaID}})
                                    .then(() => 
                                        res.status(200).end("Aliança renomeada")
                                    )
                                    .catch(err => 
                                        res.status(500).end(err.message)
                                    )
                            }
                            else if(alianca.nome.toLowerCase() == params.nome.toLowerCase())
                                res.status(400).end("Nome já existe")
                            else if(alianca.tag.toLowerCase() == params.tag.toLowerCase())
                                res.status(400).end("TAG já existe")
                            else
                                res.status(500).end("Erro ao renomear a aliança")
                        })
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err =>
                res.status(400).end(err.message)
            )
    }
})

router.post('/set-sucessor', (req, res) =>{
    /**
     * @type {{sucessor : number}}
     */
    let params = req.body;
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.sucessor || params.sucessor == req.session.usuario.id)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider)
                {
                    if(params.sucessor == 'null')
                    {
                        models.Alianca.update({sucessor : null}, {where : {id : participacao.aliancaID}})
                        .then(() => 
                            res.status(200).end("")
                        )
                        .catch(err => 
                            res.status(err.message)
                        )
                    }
                    else
                    {
                        models.Usuario_Participa_Alianca.findOne({where : {usuarioID : params.sucessor}})
                            .then(usuario => {
                                if(usuario)
                                {
                                    models.Alianca.update({sucessor : params.sucessor}, {where : {id : participacao.aliancaID}})
                                        .then(() => 
                                            res.status(200).end("")
                                        )
                                        .catch(err => 
                                            res.status(err.message)
                                        )
                                }
                                else
                                    res.status(400).end("Parâmetros inválidos")
                        })
                    }
                    
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


router.post('/set-template-aplicacao', (req, res) => {
    /**
     * @type {{template : string}}
     */
    let params = req.body

    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(typeof(params.template) == 'undefined')
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider)
                {
                    params.template = sanitizer.escape(params.template).replace(/(?:\r\n|\r|\n)/g, '<br />')

                    models.Alianca.update({aplicacao_template : params.template}, {where : {id : participacao.aliancaID}})
                        .then(() => 
                            res.status(200).end("Template atualizado com sucesso")
                        )
                        .catch(err => 
                            res.status(500).end(err.message)
                        )
                }
                else
                    res.status(403).end("Sem permição")
            })
        .catch(err => 
            res.status(403).end(err.message)
        )
    }
})

const tamanhoPaginaTopicos = 10;
router.get('/get-topicos', (req, res) => {
    /**
     * @type {{pagina : number}}
     */
    let params = req.query
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.pagina || isNaN(params.pagina))
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                models.Forum_Topico.findAndCountAll({
                    where :{
                        aliancaID : participacao.aliancaID
                    },
                    order:
                    [
                        ['destaque', 'desc'],
                        ['atualizado', 'desc']
                    ],
                    limit : tamanhoPaginaTopicos,
                    offset : ((params.pagina > 0 ? params.pagina : 1) - 1) * tamanhoPaginaTopicos
                })
                    .then(resulado => {
                        let topicos = resulado.rows
                        let totalTopicos = resulado.count
                        let promesas = new Array();
                        topicos.forEach((topico, index) => {
                            promesas.push(new Promise((resolve, reject) => {
                                models.Forum_Mensagem.findAndCount({where :{topicoID : topico.id}, attributes : ['id', 'usuarioID', 'criacao'], order : [['id', 'DESC']], limit : 1})
                                    .then(resultado => {
                                        let totalMensagens = resultado.count
                                        if(totalMensagens != 0)
                                        {   
                                            let ultimaMensagem = resultado.rows[0]
                                            models.Usuario.findOne({where : {id : ultimaMensagem.usuarioID}, attributes: ['id', 'nick']})
                                                .then(usuarioUltimaMensagem => {
                                                    ultimaMensagem.dataValues.usuario = usuarioUltimaMensagem
                                                    topicos[index].dataValues.ultimaMensagem = ultimaMensagem.dataValues
                                                    topicos[index].dataValues.totalMensagens = totalMensagens;
                                                    resolve()
                                                })
                                                .catch(err => 
                                                    reject(err)
                                                )
                                        }
                                        else
                                        {
                                            topicos[index].dataValues.ultimaMensagem = null
                                            topicos[index].dataValues.totalMensagens = 0;
                                            resolve()
                                        }
                                        
                                    })
                                    .catch(err => 
                                        reject(err)
                                    )
                            }))
                        })

                        Promise.all(promesas)
                            .then(() => 
                                res.status(200).json({topicos : topicos, total : totalTopicos, tamanhoPagina : tamanhoPaginaTopicos})
                            )
                            .catch(err => 
                                res.status(500).end(err.message)
                            )
                    })
                    .catch(err => 
                        res.status(500).end(err.message)
                    )
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})

const tamanhoPaginaMensagemTopico = 15;
router.get('/get-mensagens-topico', (req, res) => {
    /**
     * @type {{topico : number, pagina : number}}
     */
    let params = req.query
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!(params.topico && params.pagina))
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                models.Forum_Topico.findOne({where : {aliancaID : participacao.aliancaID, id : params.topico}})
                    .then(topico => {
                        if(!topico)
                            res.status(400).end("Tópico não existe")
                        else
                        {
                            models.Forum_Mensagem.findAndCount({
                                where :{
                                    topicoID : params.topico,
                                },
                                order:
                                [
                                    ['id', 'asc']
                                ],
                                limit : tamanhoPaginaMensagemTopico, 
                                offset : ((params.pagina > 0 ? params.pagina : 1) - 1) * tamanhoPaginaMensagemTopico
                            })
                                .then(resultado => {
                                    let mensagens = resultado.rows
                                    let totalMensagens = resultado.count
                                    let promesas = new Array();
                                    mensagens.forEach((mensagem, index) => {
                                        promesas.push(new Promise((resolve, reject) => {
                                            models.Usuario.findOne({where : {id : mensagem.usuarioID}, attributes: ['id', 'nick']})
                                                .then(usuarioMensagem => {
                                                    mensagens[index].dataValues.usuario = usuarioMensagem.dataValues;
                                                    resolve()
                                                })
                                                .catch(err => 
                                                    reject(err)
                                                )
                                        }))
                                    })

                                    Promise.all(promesas)
                                        .then(() => 
                                            res.status(200).json({mensagens : mensagens, total : totalMensagens, tamanhoPagina : tamanhoPaginaMensagemTopico})
                                        )
                                        .catch(err => 
                                            res.status(500).end(err.message)
                                        )

                                })
                                .catch(err => 
                                    res.status(500).end(err.message)
                                )
                        }
                    })
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


router.post('/inserir-topico', (req, res) => {
    /**
     * @type {{nome : string, responder : boolean, destaque : boolean}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!(params.nome && params.responder && params.destaque))
        res.status(400).end("Parâmetros inválidos")
    else if(params.nome.length == 0)
        res.status(400).end("Nome do tópico deve contem 1 caractér")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider || participacao.rank.gerenciar_forum)
                {
                    params.responder = params.responder == "true" || params.responder == "1"
                    params.destaque = params.destaque == "true" || params.destaque == "1"
                    params.nome = sanitizer.escape(params.nome)
                    
                    models.Forum_Topico.create({aliancaID : participacao.aliancaID, nome : params.nome, responder : params.responder, destaque : params.destaque})
                        .then(topico => 
                            res.status(200).json(topico.dataValues)
                        )  
                        .catch(err => 
                            res.status(500).end(err.message)
                        )
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


router.post('/inserir-mensagem-topico', (req, res) => {
    /**
     * @type {{conteudo : string, topico : number}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!(params.conteudo && params.topico))
        res.status(400).end("Parâmetros inválidos")
    else if(params.conteudo.length == 0)
        res.status(400).end("Nome do tópico deve contem 1 caractér")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider || participacao.rank.gerenciar_forum)
                {
                    params.conteudo = sanitizer.escape(params.conteudo)

                    models.Forum_Topico.findOne({where : {aliancaID : participacao.aliancaID, id : params.topico}})
                        .then(topico => {
                            if(!topico)
                                res.status(400).end("Tópico não existe")
                            else
                            {
                                models.Con.transaction()
                                    .then(transacao => {
                                        let promessas = new Array()
                                        promessas.push(
                                            models.Forum_Mensagem.create({conteudo : params.conteudo, usuarioID : req.session.usuario.id, topicoID : params.topico}, {transaction : transacao})
                                        )
                                        promessas.push(
                                            models.Forum_Topico.update({criacao : new Date()}, {where : {id : topico.id}, transaction : transacao})
                                        )
                                        Bluebird.all(promessas)
                                            .then(resultado => {
                                                transacao.commit()
                                                    .then(() => 
                                                        res.status(200).json(resultado[0]) //Resultado[0] = mensagem criada
                                                    )
                                            })
                                            .catch(err => 
                                                res.status(500).end(err.message)
                                            )
                                    })
                            }
                        })
                        .catch(err => 
                            res.status(500).end(err.message)
                        )
                }
                else
                    res.status(403).end("Sem permição")
                
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})



router.post('/editar-topico', (req, res) => {
 /**
     * @type {{nome : string, responder : boolean, destaque : boolean, id : number}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!(params.nome && params.responder && params.id))
        res.status(400).end("Parâmetros inválidos")
    else if(params.nome.length == 0)
        res.status(400).end("Nome do tópico deve contem 1 caractér")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider || participacao.rank.gerenciar_forum)
                {
                    models.Forum_Topico.findOne({where : {aliancaID : participacao.aliancaID, id : params.id}})
                        .then(topico => {
                            if(topico)
                            {
                                params.responder = params.responder == "true" || params.responder == "1"
                                params.destaque = params.destaque == "true" ||  params.destaque == "1"
                                params.nome = sanitizer.escape(params.nome)
                                models.Forum_Topico.update({nome : params.nome, responder : params.responder, destaque : params.destaque}, {where : {id : params.id}})
                                    .then(() => {
                                        res.status(200).end("Tópico atualizadom com sucesso")
                                    })
                            }
                            else
                                res.status(400).end("Tópico inválido")
                        })
                        .catch(err => 
                            res.status(500).end(err.message)
                        )
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


router.post('/editar-mensagem-topico', (req, res) => {
    /**
     * @type {{id : number, conteudo : string}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!(params.id && params.conteudo))
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                models.Forum_Mensagem.findOne({where : {id : params.id}, attributes : ['topicoID']})
                    .then(mensagem => {
                        if(mensagem && (mensagem.usuarioID == req.session.usuario.id || participacao.rank.lider || participacao.rank.gerenciar_forum))
                        {
                            models.Forum_Topico.findOne({where : {id : mensagem.topicoID}, attributes : ['aliancaID']})
                                .then((topico) => {
                                    if(topico.aliancaID == participacao.aliancaID)
                                    {
                                        params.conteudo = sanitizer.escape(params.conteudo)
                                        models.Forum_Mensagem.update({conteudo : params.conteudo}, {where : {id : params.id}})
                                            .then(() =>
                                                res.status(200).end("Mensagem alterada com sucesso")
                                            )
                                            .catch(err =>
                                                res.status(500).end(err.message)
                                            )
                                    }
                                    else
                                        res.status(403).end("Mensagem inválida")
                                })
                        }
                        else
                            res.status(403).end("Mensagem não existe")
                    })
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


router.post('/excluir-topico', (req, res) => {
    /**
     * @type {{id : number}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.id)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider || participacao.rank.gerenciar_forum)
                {
                    models.Forum_Topico.destroy({where : {id : params.id, aliancaID : participacao.aliancaID}})
                        .then(() => 
                            res.status(200).end("Tópico excluido com sucesso")
                        )
                        .catch(err => 
                            res.status(500).end(err.message)
                        )
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})

router.post('/excluir-mensagem', (req, res) => {
    /**
     * @type {{id : number}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.id)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                models.Forum_Mensagem.findOne({where : {id : params.id}, attributes : ['id', 'topicoID', 'usuarioID']})
                    .then(mensagem => {
                        if(mensagem && (mensagem.usuarioID == req.session.usuario.id || participacao.rank.lider || participacao.rank.gerenciar_forum))
                        {
                            models.Forum_Topico.findOne({where : {id : mensagem.topicoID}, attributes : ['aliancaID']})
                                .then((topico) => {
                                    if(topico.aliancaID == participacao.aliancaID)
                                    {
                                        models.Forum_Mensagem.destroy({where : {id : mensagem.id}})
                                            .then(() =>
                                                res.status(200).end("Mensagem excluida com sucesso")
                                            )
                                            .catch(err =>
                                                res.status(500).end(err.message)
                                            )
                                    }
                                    else
                                        res.status(403).end("Mensagem inválida")
                                })
                        }
                        else
                            res.status(403).end("Mensagem não existe")
                    })

            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


const tamanhoPaginaCiculares = 15
router.get('/get-mensagens-circulares', (req, res) => {
    /**
     * @type {{pagina : number}}
     */
    let params = req.query
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.pagina)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao =>{
                models.Alianca_Mensagem_Circular_Visualizada.findAndCountAll({
                    where : 
                    {
                        usuarioID : participacao.usuarioID, 
                        excluida : false
                    },
                    order : 
                    [
                        ['mensagemID', 'DESC']
                    ],
                    limit : tamanhoPaginaCiculares, 
                    offset : ((params.pagina > 0 ? params.pagina : 1) - 1) * tamanhoPaginaCiculares})
                        .then(resultado => {
                            let pseudomensagens = resultado.rows
                            let total = resultado.count

                            let promessas = new Array()
                            pseudomensagens.forEach((pmensagem, index) =>{
                                promessas.push(
                                    models.Alianca_Mensagem_Circular.findOne({where : {id : pmensagem.mensagemID}})
                                        .then(mensagem => {
                                            pmensagem.dataValues.conteudo = mensagem.dataValues
                                        })
                                )
                            })
                            Bluebird.all(promessas)
                                .then(() =>{
                                    res.status(200).json({mensagens : pseudomensagens, total : total, tamanhoPagina : tamanhoPaginaCiculares})
                                })
                                .catch(err =>
                                    res.status(500).end(err.message)
                                )
                        })
            })
    }
})
/**
 * 
 * @param {number} aliancaID O id da aliança
 * @param {string} mensagem O conteúdo da mensagem
 * @param {number} [remetente] O id do remetente. Opcional
 * @description Envia uma mensagem circular
 * @returns {Bluebird.<Object>} Retorna Bluebird com o objecto sequelize.model da mensagem
 */
function EnviarMensagemCircular(aliancaID, mensagem, remetente)
{
    let origem = (typeof(remetente) !== 'undefined') ? remetente : false
    return new Bluebird((resolve, reject) => {
        models.Con.transaction()
            .then(transacao => {
                models.Alianca_Mensagem_Circular.create({mensagem : sanitizer.escape(mensagem), aliancaID : aliancaID}, {transaction : transacao})
                    .then(criada => {
                            models.Usuario_Participa_Alianca.findAll({where : {aliancaID : aliancaID}, transaction : transacao, attributes : ['usuarioID']})
                            .then(participacoes => {
                                let promessas = new Array()
                                participacoes.forEach((parti) => {
                                    promessas.push(
                                        models.Alianca_Mensagem_Circular_Visualizada.create({
                                            usuarioID : parti.usuarioID,
                                            mensagemID : criada.id, 
                                            visualizada : (origem !== false) ? parti.usuarioID == origem : false}
                                            , 
                                            {transaction : transacao})
                                    )
                                })
                                Bluebird.all(promessas)
                                    .then(() => {
                                        transacao.commit()
                                            .then(() => 
                                                resolve(criada)
                                            )
                                            .catch(err =>
                                            {
                                                transacao.rollback()
                                                reject(err)
                                            }) 
                                    })
                                    .catch(err =>
                                    {
                                        transacao.rollback()
                                        reject(err)
                                    }) 
                            })
                            .catch(err =>
                            {
                                transacao.rollback()
                                reject(err)
                            })  

                    })
                    .catch(err =>
                    {
                        transacao.rollback()
                        reject(err)
                    })
            })
            .catch(err =>
                reject(err)
            )
    })
}

router.post('/set-mensagem-circular-visualizada', (req, res) => {
    /**
     * @type {{mensagemID : number}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.mensagemID)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                models.Alianca_Mensagem_Circular_Visualizada.update({visualizada : true}, {where : {usuarioID : req.session.usuario.id, mensagemID : params.mensagemID}})
                    .then(() => {
                        res.status(200).end("Mensgem visualizada com sucesso")
                    })
                    .catch(err =>
                        res.status(500).end(err.message)
                    )
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})

router.post('/enviar-mensagem-circular', (req, res) => {
    /**
     * @type {{conteudo : string}}
     */
    let params = req.body
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else if(!params.conteudo)
        res.status(400).end("Parâmetros inválidos")
    else
    {
        getParticipacao(req)
            .then(participacao => {
                if(participacao.rank.lider || participacao.rank.mensagens)
                {
                    EnviarMensagemCircular(participacao.aliancaID, params.conteudo, participacao.usuarioID)
                        .then(criada => {
                            res.status(200).json(criada)
                        })
                        .catch(err => 
                            res.status(500).end(err.message)
                        )  
                }
                else
                    res.status(403).end("Sem permição")
            })
            .catch(err => 
                res.status(400).end(err.message)
            )
    }
})


router.get('/get-aliancadata', (req, res) => {
    if(req.session.usuario)
    {
      if(!req.query.id)
        res.status(400).end("Parâmetros inválidos");
      else
      {
        models.Alianca.findOne({where : {id:req.query.id}}).then(alianca => {
          if(!alianca)
            res.status(404).end("Aliança não existe");
          else
          {
              models.Usuario_Participa_Alianca.count({where : {aliancaID : alianca.id}}).then(contagem => {
                alianca.dataValues.totalMembros = contagem
                delete alianca.dataValues.paginaInterna
                delete alianca.dataValues.lider
                delete alianca.dataValues.sucessor
                res.status(200).json(alianca.dataValues)
              })
          }
        })
      }
    }
    else
      res.status(403).end("Operação inválida")
  })
  
  router.get('/get-aplicacao-alianca', (req, res) => {
    if(req.session.usuario)
    {
      models.Alianca_Aplicacao.findOne({where : {usuarioID : req.session.usuario.id}}).then(aplicacao => {
        res.status(200).json(aplicacao)
      })
    }
    else
      res.status(403).end("Operação inválida")
  })

module.exports = router;
