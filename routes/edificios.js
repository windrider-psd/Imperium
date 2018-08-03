var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const GR = require('./../model/GerenciadorRecursos')
const edificios = ['minaFerro', 'minaCristal', 'minaUranio', 'minaFerro', 'fazenda', 'sintetizadorCombustivel', 'plantaSolar', 'reatorFusao', 'fabricaEletronica'];
const croner = require('./../model/Croner');

router.post('/upgrade', function(req, res)
{
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        let params = req.body;
        if(!params.planeta || isNaN(params.planeta) || !params.edificio || !edificios.includes(params.edificio))
        {
           res.status(400).end("Parâmetros inválidos")
        }
        else
        {
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
                            let custo;
                            switch(params.edificio)
                            {
                                case 'minaFerro':
                                    custo = GR.GetCustoUpgradeMinaFerro(planeta.minaFerro + 1);
                                    break;
                                case 'minaCristal':
                                    custo = GR.GetCustoUpgradeMinaCristal(planeta.minaCristal + 1);
                                    break;
                                default:
                                    res.status(400).end("Edificio não existe");
                                    return;
                            }
                            
                            if(custo.ferro > planeta.recursoFerro || custo.cristal > planeta.recursoCristal || custo.uranio > planeta.recursoUranio)
                                res.status(400).end("Você não tem recursos necessários");
                            else
                            {
                                var tempo = GR.GetTempoConstrucao(custo.ferro, custo.cristal, custo.uranio);
                                croner.AdicionarConstrucao(planeta.id, params.edificio, tempo);
                                planeta.recursoFerro = planeta.recursoFerro - custo.ferro;
                                planeta.recursoCristal = planeta.recursoCristal - custo.cristal;
                                planeta.recursoUranio = planeta.recursoUranio - custo.uranio;
                                res.status(200).end("Requisição aceita. Edificio sendo melhorado");
                            }
                        }
                    });
                }
                
            });
        }
    }
});

module.exports = router;