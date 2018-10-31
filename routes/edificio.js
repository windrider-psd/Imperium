var express = require('express');
var router = express.Router();
const models = require('./../model/DBModels')
const GR = require('./../services/shared/GerenciadorRecursos')
const croner = require('./../services/Croner');
const io = require('./../model/io')
const Bluebird = require('bluebird')
let edificioPrefabs = require('./../prefabs/Edificio')
let edificioBuilder = require('./../prefabs/EdificioBuilder')

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
            if(!edificioPrefabs[params.edificio])
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
                            let promessas = []
                            promessas.push(
                                new Bluebird((resolve) => {
                                    models.RecursosPlanetarios.findOne({where : {planetaID : planeta.id}})
                                        .then(recursos => resolve(recursos))
                                })
                            )
                            promessas.push(
                                new Bluebird((resolve) => {
                                    models.Edificios.findOne({where : {planetaID : planeta.id}})
                                        .then(edificios => resolve(edificios))
                                })
                            )
                            Bluebird.all(promessas)
                                .then((retorno) => {
                                    let recursos = retorno[0]
                                    let edificios = retorno[1]
                                    //let custo = GR.GetCustoEdificioPorId(coluna, edificios[params.edificio] + 1)
                                    let custo = edificioPrefabs[params.edificio].melhoria(edificios[params.edificio]);
                                    if(custo.ferro > recursos.recursoFerro || custo.cristal > recursos.recursoCristal || custo.titanio > recursos.recursoTitanio || custo.componente > recursos.recursoComponente)
                                        res.status(400).end("Você não tem recursos necessários");
                                    else
                                    {
                                        //let tempo = GR.GetTempoConstrucao(custo.ferro, custo.cristal, custo.componentes, custo.titanio, edificios.fabricaRobos)
                                        let tempo = edificioBuilder.getTempoConstrucao(custo, 0);
                                        croner.AdicionarConstrucao(planeta.id, params.edificio, tempo, (err, construcao) =>
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
                                                    res.status(400).end(err.message)
                                            }
                                            else
                                            {
                                                let update = 
                                                {
                                                    recursoFerro : recursos.recursoFerro - custo.ferro,
                                                    recursoCristal : recursos.recursoCristal - custo.cristal,
                                                    recursoComponente : recursos.recursoComponente - custo.componente,
                                                    recursoTitanio : recursos.recursoTitanio - custo.titanio,
                                                }
                                                models.RecursosPlanetarios.update(update, {where : {planetaID : planeta.id}})
                                                    .then(() => {
                                                        res.status(200).json(construcao)
                                                        io.EmitirParaSessao(req.session.usuario.id, 'edificio-melhorando', construcao)
                                                        io.EmitirParaSessao(req.session.usuario.id, 'recurso-planeta' + planeta.id, update);
                                                    })
                                                    
                                            }  
                                        });    
                                    }
                                })
                            
                        }
                    });
                }
            });
        }
    }
});

router.post('/cancelar-melhoria', function(req, res)
{
    if(!req.session.usuario)
        res.status(403).end("Operação inválida")
    else
    {
        /**
         * @type {{planeta : number,  edificio: number|string}}
         */
        let params = req.body
        if(!params.planeta || !params.edificio)
            res.status(400).end("Parâmetros inválidos")
        else if(!edificioPrefabs[params.edificio])
            res.status(400).end("Edificio inválido")
        else
        {
           

            models.Con.query('SELECT * FROM planeta WHERE id = ' + Number(params.planeta) + ' and exists (select * from setors where usuarioID  = '+ req.session.usuario.id +' and setors.id = planeta.setorID) limit 1').spread((planeta) =>
            {
                if(planeta.length == 0)
                    res.status(400).end('Planeta não encontrado');
                else
                {   
                    models.Construcao.findOne({where : {planetaID: planeta[0].id, edificio : params.edificio}}).then((construcao) =>
                    {
                        if(!construcao)
                            res.status(400).end("Edificio não está sendo melhorado")
                        else
                        {
                            io.EmitirParaSessao(req.session.usuario.id, 'cancelar-melhoria', construcao.dataValues);
                            croner.RemoverConstrucao(params.planeta, params.edificio);
                            res.status(200).end("Construção cancelada com sucesso");
                        }
                    });
                }
            });
        }
    }
})

module.exports = router;