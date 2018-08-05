var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const GR = require('./../model/GerenciadorRecursos')
const croner = require('./../model/Croner');

router.post('/melhorar', function(req, res)
{
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        /**
         * @type {{edificio : number|string, planeta : number}}
         */
        let params = req.body;
        if(!params.planeta || isNaN(params.planeta) || !params.edificio)
        {
           res.status(400).end("Parâmetros inválidos")
        }
        else
        {
            let coluna;
            if(GR.VerificarIDEdificio(params.edificio))
            {
                if(typeof(params.edificio) === 'number')
                {
                    coluna = GR.EdificioIDParaString(params.edificio)
                }
                else
                {
                    if(isNaN(params.edificio))
                    {
                        coluna = params.edificio;
                    }
                    else
                    {
                        coluna = GR.EdificioIDParaString(Number(params.edificio));
                    }
                }
            }
            else
            {
                res.status(400).end("Edificio não é valido");
                return;
            }
            models.Planeta.findOne({where : {id : params.planeta}}).then((planeta) =>
            {
                if(!planeta.colonizado == true)
                    res.status(400).end("O planeta não está colonizado");
                else
                {
                    models.Setor.findOne({where : {id : planeta.setorID}}).then((setor) =>
                     {
                        //Verifica se o jogador realmente possui o setor do planeta
                        if(setor.usuarioID != req.session.usuario.id)
                            res.status(403).end("Operação inválida")
                        else
                        {
                            let custo = GR.GetCustoEdificioPorId(coluna, planeta[coluna] + 1)
                            if(custo.ferro > planeta.recursoFerro || custo.cristal > planeta.recursoCristal || custo.uranio > planeta.recursoUranio)
                                res.status(400).end("Você não tem recursos necessários");
                            else
                            {
                                let tempo = GR.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio)
                                croner.AdicionarConstrucao(planeta.id, GR.GetEdificioID(coluna), tempo, (err, construcao) =>
                                {
                                    if(err)
                                    {
                                        if(err.errors)
                                        {   
                                            if(err.errors[0].type == 'unique violation')
                                                res.status(400).end("Edificio já está sendo melhorado")
                                            else
                                                res.status(500).end("Erro interno")
                                        }
                                        else
                                        {
                                            res.status(400).end(err);
                                        }   
                                    }
                                       
                                    else
                                    {
                                        planeta.recursoFerro = planeta.recursoFerro - custo.ferro;
                                        planeta.recursoCristal = planeta.recursoCristal - custo.cristal;
                                        planeta.recursoUranio = planeta.recursoUranio - custo.uranio;
                                        planeta.save().then(function()
                                        {
                                            res.status(200).json(construcao)
                                        });
                                    }  
                                });
                                
                            }
                        }
                    });
                }
                
            });
        }
    }
});

module.exports = router;