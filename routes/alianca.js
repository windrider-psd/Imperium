var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const sanitizer = require("sanitizer")
const io = require('./../model/io')
var Bluebird = require('bluebird');
const formatoSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ //Sem espaço
const formatoSpecial2 = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/ //Com espaço

require('dotenv/config')

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
                models.Alianca.count({where : {nome : nome, tag : params.tag}}).then(contagem =>
                {
                    if(contagem != 0)
                        res.status(400).end("Já existe outra aliança com este nome ou tag")
                    else
                    {
                        models.Con.transaction().then(transacao => {
                            models.Alianca.create({nome : nome, lider : req.session.usuario.id, tag : params.tag}, {transaction : transacao}).then((alianca) => {
                                models.Usuario_Participa_Alianca.create({usuarioID : req.session.usuario.id, aliancaID : alianca.id, rank : null}, {transaction : transacao}).then(() =>
                                    transacao.commit().then(() => res.status(200).end("Aliança criada"))
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
                                    })
                                }
                                else
                                    models.Alianca.update({lider : alianca.sucessor, sucessor : null}, {transaction : transacao}).then(() => transacao.commit().then(() => res.status(200).end("Saída realizada com sucesso")))
                            }
                            else
                                transacao.commit().then(() =>res.status(200).end("Saída realizada com sucesso"))
                        })
                    }).catch(() => res.status(500).end("Houve um erro ao sair da aliança"))
                })
            }
        })
    }
})

module.exports = router;
