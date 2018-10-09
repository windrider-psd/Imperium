let express = require('express');
let router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
const path = require('path')
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
                                                }
                                                else
                                                {
                                                    setor.setor['aliancaID'] = null
                                                }
                                                resolvep()
                                            })
                                        })
                                        let promessaNick = new Promise((resolvep => {   
                                            models.Usuario.findOne({where : {id : setor.setor.usuarioID}, attributes : ['nick', 'ferias','banido', 'pontosPesquisa', 'pontosEconomia', 'pontosMilitar', 'pontosHonra']})
                                                .then(usuario => {
                                                    setor.setor['usuario'] = usuario
                                                    resolvep()     
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
