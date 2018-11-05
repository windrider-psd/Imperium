let express = require('express');
let router = express.Router();
const models = require('./../model/DBModels')
const MUtils = require('./../services/DBModelsUtils')
router.get('/frota', (req, res) => {
    if(req.session.usuario)
    {
        /**
         * @type {{planetaid : number}}
         */
        let params = req.query;
        if(params.planetaid || !isNaN(params.planetaid))
        {
            models.Frota.findOne({where : {planetaID : params.planetaid}})
                .then(frota => {
                    if(frota)
                    {
                        if(frota.usuarioID != req.session.usuario.id)
                        {
                            res.status(403).end("planetaid inválido")
                        }
                        else
                        {
                            res.status(200).json(frota)
                        }
                    }
                    else
                    {
                        models.Planeta.findOne({where : {id : params.planetaid}})
                            .then((planeta) => {
                                if(planeta)
                                {
                                    MUtils.GetUsuarioPlaneta(planeta)
                                        .then(usuario =>
                                        {
                                            if(usuario)
                                            {
                                                if(usuario.dataValues.id == req.session.usuario.id)
                                                {
                                                    models.Frota.create({planetaID : params.planetaid, usuarioID : req.session.usuario.id})
                                                        .then((criada) => {
                                                            res.status(200).json(criada);
                                                        })
                                                }
                                                else
                                                {
                                                    res.status(400).end("Frota não encontrada")
                                                }
                                            }
                                            else
                                            {
                                                res.status(400).end("Frota não encontrada")
                                            }
                                            
                                        })
                                        .catch(() => {
                                            res.status(400).end("Frota não encontrada")
                                        })
                                }
                                else
                                {
                                    res.status(400).end("Frota não encontrada")
                                }
                            })
                        
                        
                    }
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


module.exports = router;