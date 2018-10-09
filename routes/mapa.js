let express = require('express');
let router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
const ranking = require('./../services/Ranking')
require('dotenv/config')


router.get('/get-galaxia', (req, res) => {
    if(req.session.usuario)
    {
        models.Setor.findAll({})
            .then(setores => {
                MUtils.getSetoresInfo(setores)
                    .then(info => 
                    {
                        let promessas = []
                        info.forEach((setor) => {
                            promessas.push(
                                new Promise((resolve) => {
                                    if(setor.setor.usuarioID == null)
                                    {
                                        resolve()
                                    }
                                    else
                                    {
                                        let promessaParticipacao = new Promise((resolvep) => {
                                            models.Usuario_Participa_Alianca.findOne({where : {usuarioID : setor.setor.usuarioID}, attributes : ['aliancaID']})
                                            .then(participacao => {
                                                if(participacao)
                                                {
                                                    setor.setor['aliancaID'] = participacao.aliancaID
                                                    models.Alianca.findOne({where : {id : participacao.aliancaID}, attributes : ['nome']})
                                                        .then(alianca => {
                                                            setor.setor['aliancaNome'] = alianca.nome
                                                            resolvep()
                                                        })
                                                }
                                                else
                                                {
                                                    setor.setor['aliancaID'] = null
                                                    resolvep()
                                                }
                                                
                                            })
                                        })
                                        let promessaNick = new Promise((resolvep => {   
                                            models.Usuario.findOne({where : {id : setor.setor.usuarioID}, attributes : ['id', 'nick', 'ferias','banido', 'pontosPesquisa', 'pontosEconomia', 'pontosMilitar', 'pontosHonra']})
                                                .then(usuario => {
                                                    ranking.GetRankingUsuario(usuario.id).then(rank => {
                                                        setor.setor['usuario'] = usuario
                                                        setor.setor['usuario'].dataValues['classificacao'] = rank
                                                        resolvep()    
                                                    })
                                                    
                                                     
                                                })
                                        }))

                                        Promise.all([promessaNick, promessaParticipacao])
                                            .then(() => {
                                                resolve();
                                            })
                                    }
                                       
                                })
                            )
                        });
                        Promise.all(promessas)
                            .then(() => {

                                let resposta = {
                                    setores : info,
                                    galaxia_tamanho_x : Number(process.env.UNIVERSE_SIZE_X),
                                    galaxia_tamanho_y : Number(process.env.UNIVERSE_SIZE_Y)
                                }
                                res.status(200).json(resposta)
                            })
                        
                    })
            })
            .catch(err => {
                res.status(500).end(err.message)
            })
    }
    else
    {
        res.status(403).end("Sem permição")
    }
})


module.exports = router;
