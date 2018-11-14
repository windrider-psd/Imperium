const models = require('./../model/DBModels');
const cron = require('node-cron');
const io = require('./../model/io');
const MUtils = require('./DBModelsUtils')
const ranking = require('./Ranking')
const Bluebird = require('bluebird')
const edificioBuiler = require('./../prefabs/EdificioBuilder')
const edificioPrefab = require('./../prefabs/Edificio')
const navePrefab = require('./../prefabs/Nave')
const naveBuilder = require('./../prefabs/NaveBuilder')
const pathFinder = require('./../services/Pathfinder')
const operacaoControler = require('./OperacaoController')
/**
 * @type {Array.<{planetaID : number, edificioID : number, timeout : NodeJS.Timer}>}
 * @description Array que armazena as construções para serem executadas (timeout)
 */
var construcoes = new Array();

/**
 * @type {Array.<{planetaID : number, unidade : string, usuarioID: number, quantidade: number timeout : NodeJS.Timer}>}
 * @description Array que armazena as construções de frota para serem executadas (timeout)
 */
var construcoes_frota = new Array();


/**
 * @description Cron job para adicionar recursos para os jogadores
 */
var adicionarRecurso = cron.schedule('*/10 * * * * *', function()
{
    if(models.isReady())
    {

        models.Usuario.findAll({attributes : ['id']}).then((usuarios) => {
            
            usuarios.forEach((usuario) =>
            {
                models.Setor.findAll({where : {usuarioID :usuario.id}, attributes: ['id', 'solPosX', 'solPosY', 'solPosX', 'intensidadeSolar']}).then((setores) =>
                {
                    setores.forEach((setor) =>
                    {
                        models.Planeta.findAll({where : {colonizado : true, setorID : setor.id}}).then((planetas) =>
                        {
                            planetas.forEach((planeta) =>
                            {
                                let promessas = []
                                promessas.push(
                                    new Bluebird((resolve) => {
                                        models.RecursosPlanetarios.findOne({where : {planetaID : planeta.id}})
                                            .then(recursos => resolve(recursos.dataValues))
                                    })
                                )
                                promessas.push(
                                    new Bluebird((resolve) => {
                                        models.Edificios.findOne({where : {planetaID : planeta.id}})
                                            .then(edificios => resolve(edificios.dataValues))
                                    })
                                )
                                Bluebird.all(promessas)
                                    .then((retorno) => {
                                        let recursos = retorno[0]
                                        let edificios = retorno[1]
                                        
                                        let isp = edificioBuiler.getIntensidadeSolarPlaneta({x : setor.solPosX, y : setor.solPosY}, {x : planeta.posX, y : planeta.posY}, setor.intensidadeSolar);
                                        let true_edificios = {};
                                        for(let chave in edificioPrefab)
                                        {
                                            let edit = edificioBuiler.getEdificio(chave)
                                            if(edit != null)
                                            {
                                                edit.nivel = edificios[chave]
                                        
                                                true_edificios[chave] = edit;
                                            }
                                            
                                        }
                                        let producao = edificioBuiler.getProducao(true_edificios, isp);
                                        let capacidade = producao.capacidade
        
                                        let soma = producao.ferro + recursos.recursoFerro;
                                        let updateFerro = (soma < capacidade) ? soma : capacidade; 

                                        soma = producao.cristal + recursos.recursoCristal;
                                        let updateCristal = (soma < capacidade) ? soma : capacidade; 
                                        
                                        soma = producao.componente + recursos.recursoComponente;
                                        let updateComponentes = (soma < capacidade) ? soma : capacidade; 
                                        
                                        soma = producao.titanio + recursos.recursoTitanio;
                                        let updateTitanio = (soma < capacidade) ? soma : capacidade; 
        
                                        
                                        let update = {
                                            recursoFerro : updateFerro, 
                                            recursoCristal : updateCristal,
                                            recursoTitanio : updateTitanio, 
                                            recursoComponente : updateComponentes
                                        }
        
                                        models.RecursosPlanetarios.update(update, {where : {planetaID : planeta.id}});
                                        io.EmitirParaSessao(usuario.id, 'recurso-planeta' + planeta.id, update);
                                    })
                            });
                        })  
                    }) 
                });
            })  
        });
    }
})


function CriarConstrucaoFrotaTimer(unidade, quantidade, duracao, usuarioID, planetaID, nave)
{
    return setTimeout(() => {
        models.Frota.findOne({where : {planetaID : planetaID, usuarioID: usuarioID}})
            .then((frota) => {
                let total = Number(frota.dataValues[unidade]) + Number(quantidade);
    
                frota[unidade] = total;
                frota.save()
                    .then(() => {
                        for(let chave in nave.custo)
                        {
                            nave.custo[chave] = nave.custo[chave] * quantidade;
                        }
                        models.Frota_Construcao.destroy({where :{planetaID : planetaID}});
                        ranking.AdicionarPontos(usuarioID, nave.custo, ranking.TipoPontos.pontosMilitar);
                        //Emitir para id da sessão
                    })
            })

    }, duracao * 1000)
}


/**
 * @param {string} edificio 
 * @param {number} planetaID 
 * @param {number} duracao 
 * @return {NodeJS.Timer}
 */
function CriarConstrucaoTimer(edificio, planetaID, duracao)
{   
    return setTimeout(() => 
    {
        models.Planeta.findOne({where : {id : planetaID}}).then((planeta) =>{
            
            models.Edificios.findOne({where : {planetaID : planetaID}})
                .then((edi) => {
                    edi[edificio] = edi[edificio] + 1
                    edi.save().then(() => {
                        MUtils.GetUsuarioPlaneta(planeta).then((usuario) =>
                        {
                            //let custo = GR.GetCustoEdificioPorId(edificioID, edi[edificio]);
                            let custo = edificioPrefab[edificio].melhoria(edi[edificio])
                            ranking.AdicionarPontos(usuario, custo, ranking.TipoPontos.pontosEconomia);
                            io.EmitirParaSessao(usuario.id, 'edificio-melhoria-completa', {planetaID : planetaID, edificio : edificio});
                        });
                    });
                })  
        });
        RemoverConstrucao(planetaID, edificio);
    }, duracao * 1000)
}

/**
 * @param {number} usuarioID
 * @param {number} planetaID 
 * @param {string} unidade
 * @param {number} quantidade
 * @param {number} nivelHangar
 * @returns {Promise}
 */
function AdicionarFrota(usuarioID, planetaID, unidade, quantidade, nivelHangar)
{
    return new Promise((resolve, reject) => {
        let nave = naveBuilder.getNavePorNomeTabela(unidade);
        if(nave == null)
        {
            reject(new Error(`Nave "${unidade}" não existe`))
        }
        else
        {
            for(let chave in nave.custo)
            {
                nave.custo[chave] = nave.custo[chave] * quantidade;
            }
            models.RecursosPlanetarios.findOne({where : {planetaID : planetaID}})
                .then(recursos => {
                    let valido = true

                    let updateFerro = recursos.dataValues.recursoFerro - nave.custo.ferro * quantidade;
                    if(updateFerro < 0)
                    {
                        reject(new Error("Ferro insuficiente"))
                        valido = false
                    }
                    
                    let updateCristal = recursos.dataValues.recursoCristal - nave.custo.cristal * quantidade;
                    if(updateCristal < 0)
                    {
                        reject(new Error("Cristal insuficiente"))
                        valido = false
                    }

                    
                    let updateComponente = recursos.dataValues.recursoComponente - nave.custo.componente * quantidade;
                    if(updateComponente < 0)
                    {
                        reject(new Error("Componentes insuficiente"))
                        valido = false
                    }

                    
                    let updateTitanio = recursos.dataValues.recursoTitanio - nave.custo.titanio * quantidade;
                    if(updateTitanio < 0)
                    {
                        reject(new Error("Titanio insuficiente"))
                        valido = false
                    }

                    recursos['recursoFerro'] = updateFerro
                    recursos['recursoCristal'] = updateCristal
                    recursos['recursoComponente'] = updateComponente
                    recursos['recursoTitanio'] = updateTitanio

                    if(valido)
                    {
                        recursos.save()
                            .then(() => console.log("sucesso"))
                            .catch(err => {console.log(err)})   
                        
                        let duracao = naveBuilder.getTempoConstrucao(nave, nivelHangar) * quantidade;
                        models.Frota_Construcao.create({unidade: unidade, inicio : new Date(), duracao : duracao, planetaID : planetaID})
                            .then((construcao) => {
                                let timer = CriarConstrucaoFrotaTimer(unidade, quantidade, duracao, usuarioID, planetaID, nave);
                                construcoes_frota.push({planetaID: planetaID, quantidade: quantidade, usuarioID : usuarioID, timeout : timer})
                                resolve(construcao)
                            })
                    }
                })
        }
    })
    
}

/**
 * @param {number} planetaID O ID do planeta da construção
 * @param {string} edificio O ID do edificio
 * @param {number} duracao A duração da construção em segundos
 * @param {function} callback callback(err, construcao)
 * @description Adiciona uma construção à um planeta
 */
function AdicionarConstrucao(planetaID, edificio, duracao, callback)
{
    models.Construcao.create({planetaID : planetaID, edificio : edificio, duracao : duracao}).then((construcao)=>
    {
        let timer = CriarConstrucaoTimer(edificio, planetaID, duracao)
        construcoes.push({planetaID : planetaID, edificio : edificio, timeout : timer});
        if(typeof(callback) == 'function')
            callback(null, construcao)
    }).catch((err) =>
    {
        callback(err, null);
    });
}

/**
 * @param {number} idPlaneta O id da construção
 * @param {string} edificio O id do edificio
 * @description Remove uma construção de um planeta
 */
function RemoverConstrucao(idPlaneta, edificio)
{
    for(let i = 0; i < construcoes.length; i++)
    {
        if(construcoes[i].planetaID == idPlaneta && construcoes[i].edificio == edificio)
        {
            clearTimeout(construcoes[i].timeout);
            models.Construcao.destroy({where : {planetaID : construcoes[i].planetaID, edificio : construcoes[i].edificio}});
            construcoes.splice(i, 1);
            break;
        }
    }
}

let recuperarConstrucoes = setInterval(() =>{
    if(models.isReady())
    {
        clearInterval(recuperarConstrucoes);
        models.Construcao.findAll({}).then((construcoesModel) =>{
            
            for(let i = 0; i  < construcoesModel.length; i++)
            {
                let timer = CriarConstrucaoTimer(construcoesModel[i].edificio, construcoesModel[i].planetaID, construcoesModel[i].duracao);
                construcoes.push({planetaID : construcoesModel[i].planetaID, edificio : construcoesModel[i].edificio, timeout : timer});
                construcoesModel[i].inicio = new Date();
                construcoesModel[i].save();
            }
            
        });
    }
}, 5000)






function IniciarOperacao(usuarioid, operacao, frotaID, frotaOperacao, idPlanetaOrigem, idSetorDestino)
{
    

    models.Planeta.findOne({where : {id : idPlanetaOrigem}, attributes: ['setorID']})
        .then(planeta => {
            models.Setor.findAll(
            {
                where : 
                {
                    $or:
                    [
                        {id : planeta.setorID},
                        {id : idSetorDestino}
                    ]
                    
                }
            }
            )
                .then(setores => 
                {
                    let setorOrigem = null
                    let setorDestino = null
                    
                    for(let i = 0; i < setores.length; i++)
                    {
                        if(setorOrigem == null && setores[i].id == planeta.setorID)
                        {
                            setorOrigem = setores[i]
                        }
                        else if(setores[i].id == idSetorDestino)
                        {
                            setorDestino = setores[i]
                        }
                    }

                    models.Con.transaction()
                        .then(transacao => {
                            models.Frota.findOne({where : {id : frotaID}, transaction : transacao})
                                .then(frota => {
                                    delete frota.dataValues.usuarioID
                                    delete frota.dataValues.planetaID
                                    delete frota.dataValues.id
                                    delete frota.dataValues.operacaoID
                                    delete frota.dataValues.relatorioID
                                    for(let chave in frotaOperacao)
                                    {
                                        frota.dataValues[chave] = frota.dataValues[chave] - frotaOperacao[chave]
                                    }
                                    models.Operacao_Militar.create(
                                        {
                                            usuarioID : usuarioid, 
                                            operacao : operacao,
                                            origem : setorOrigem.id,
                                            destino: setorDestino.id,
                                            atual: setorOrigem.id,
                                        }, {transaction : transacao})
                                            .then(operacaoCriada => {
                                                let objCreateFrota = {
                                                    usuarioID : usuarioid,
                                                    operacaoID : operacaoCriada.id
                                                }
                                                let objUpdateFrota = {

                                                }
                                                for(let chave in frota.dataValues)
                                                {
                                                    //objCreateFrota[chave] = frota.dataValues[chave]
                                                    //objUpdateFrota[chave] = frota
                                                    objCreateFrota[chave] =  frotaOperacao[chave]
                                                    objUpdateFrota[chave] = frota.dataValues[chave]
                                                }
                                                models.Frota.create(objCreateFrota, {transaction : transacao})
                                                    .then(() => {
                                                        models.Frota.update(objUpdateFrota, {where : {id : frotaID}, transaction : transacao})
                                                            .then(() => {
                                                                transacao.commit();
                                                                operacaoControler.Colonizar(operacao)
                                                            })
                                                    })
                                            })

                                })
                                .catch(err => {
                                    console.log(err);
                                    transacao.rollback()
                                })
                        })
                        

                })
        })
    
}



   

module.exports = {
    Recursos : adicionarRecurso,
    AdicionarConstrucao : AdicionarConstrucao,
    RemoverConstrucao : RemoverConstrucao,
    AdicionarFrota : AdicionarFrota,
    IniciarOperacao : IniciarOperacao
}