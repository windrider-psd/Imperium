const models = require('./../model/DBModels')
const BlueBird = require('bluebird')
const ranking = require('./Ranking')
/**
 * @param {number} planetaID 
 * @description Extrai as construções de um planeta
 * @param {Function} callback callback(resultado : Array) 
 */
function GetConstrucoesPlaneta(planetaID, callback)
{
    let resultado = new Array();
    models.Construcao.findAll({where : {planetaID : planetaID}}).then((construcoes) =>
    {
        for(let i = 0; i < construcoes.length; i++)
        {
            resultado.push(construcoes[i].dataValues);
        }
        callback(resultado)
    })
}

function GetConstPlaneta(planetaID)
{
    return new BlueBird((resolve, reject) => {
        let resultado = new Array();
        models.Construcao.findAll({where : {planetaID : planetaID}}).then((construcoes) =>
        {
            for(let i = 0; i < construcoes.length; i++)
            {
                resultado.push(construcoes[i].dataValues);
            }
            resolve({planeta: planetaID, construcoes : resultado});
        })
    });
}

function EncontrarPlanetasSetor(setorID)
{
    return new BlueBird((resolve, reject) =>{

        models.Planeta.findAll({where : {setorID : setorID}}).then((planetas) =>
        {
            let promessaAll = new Array();
            for(let i = 0; i < planetas.length; i++)
            {
                planetas[i] = planetas[i].dataValues;
            }
            for(let i = 0; i < planetas.length; i++)
            {
                promessaAll.push(GetConstPlaneta(planetas[i].id));
            }
            BlueBird.all(promessaAll).then((resultado) =>
            {

                for(let i = 0; i < planetas.length; i++)
                {
                    planetas[i].construcoes = new Array();
                    for(let j = 0; j < resultado.length; j++)
                    {
                        if(resultado[j].planeta == planetas[i].id)
                        {
                            planetas[i].construcoes = resultado[j].construcoes;
                            break;
                        }
                        
                    }
                }

                resolve({setor : setorID, planetas : planetas});
            });
        }).catch((err) =>
        {
            reject(err);
        }); 

    });
}


/**
 * @param {Array.<Object>} setores
 */
function getSetoresInfo(setores)
{
    for(let i = 0; i < setores.length; i++)
    {
        setores[i] = setores[i].dataValues;
    }

    return new BlueBird((resolve, reject) =>
    {    
        let retorno = new Array();
        let promesasSetores = new Array();
        for(let i = 0; i < setores.length; i++)
        {
            promesasSetores.push(EncontrarPlanetasSetor(setores[i].id));
        }

        BlueBird.all(promesasSetores).then((resultado) => 
        {
            for(let i = 0; i < setores.length; i++)
            {
                for(let j = 0; j < resultado.length; j++)
                {
                    if(resultado[j].setor == setores[i].id)
                    {
                        retorno.push({setor : setores[i], planetas : resultado[j].planetas});
                        break;
                    }
                    
                }
            }
           
            resolve(retorno);
        }).catch((err) =>
        {
            reject(err);
        })
    })

}

/**
 * 
 * @param {Object} planeta O planeta do tipo sequelize model
 * @description Encontra o usuário do planeta;
 * @returns {BlueBird}
 */
function GetUsuarioPlaneta(planeta)
{
    return new BlueBird((resolve, reject) =>
    { 
        models.Setor.findOne({where : {id : planeta.setorID}}).then((setor) =>
        {
            if(!setor)
                reject("Setor do planeta não encontrado")
            else
            {
                models.Usuario.findOne({where : {id : setor.usuarioID}}).then((usuario) =>
                { 
                    if(!usuario)
                        reject("Usuário não encontrado")
                    else
                        resolve(usuario);
                })
            }
        });
    })
    
}

/**
 * @param {number} usuarioid 
 * @description Retorna a quantidade de mensagens privadas não lidas de um usuário
 * @returns {BlueBird.<number>} 
 */
function GetCountCaixaDeEntrada(usuarioid)
{
    return new BlueBird((resolve, reject) => {
        if(typeof(usuarioid) !== 'number')
            reject("usuarioid precisa ser um numero")
        else
            models.MensagemPrivada.count({where : {destinatario : usuarioid, visualizada : false}}).then(contagem => resolve(contagem))
    })
}

/**
 * @param {Request} req O objeto de requisição do express
 * @description Retorna um objeto que será usado no front-end
 * @returns {BlueBird.<{session : Object, sessionID : number, setores : Object, alianca : null|Object, caixaEntrada : number}>}
 */
function getUserData(req)
{
  return new BlueBird((resolve, reject) =>
  {
    if(req.session.usuario)
    {
        models.Setor.findAll({where : {usuarioID : req.session.usuario.id}}).then(sets =>
        {    
            getSetoresInfo(sets).then(resultado =>
            {
                let setores = resultado 
                ranking.GetRankingUsuario(req.session.usuario.id).then(rankusuario => {
                    GetCountCaixaDeEntrada(req.session.usuario.id).then(contagemEntrada => 
                      models.Usuario_Participa_Alianca.findOne({where:{usuarioID: req.session.usuario.id}}).then(participa => {
                        if(participa){
                          models.Alianca.findOne({where: {id : participa.aliancaID}}).then(alianca =>{
                            models.Usuario_Participa_Alianca.count({where : {aliancaID : alianca.id}}).then(contagem => {
                              alianca.dataValues.totalMembros = contagem;
                              if(participa.rank !== null)
                              {
                                models.Alianca_Rank.findOne({where : {id : participa.rank}}).then(rank =>
                                {
                                  alianca.dataValues.rank = rank;
                                  resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, alianca : alianca, setores : setores, caixaEntrada : contagemEntrada})
                                })
                              }
                              else
                              {
                                alianca.dataValues.rank = null
                                resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, alianca : alianca, setores : setores, caixaEntrada : contagemEntrada})
                              }
                            })
                            
                          })
                        }
                        else
                          resolve({session : req.session.usuario, rank : rankusuario, sessionID: req.sessionID, alianca : null, setores : setores, caixaEntrada : contagemEntrada})
                      })
                      
                    )
                  }).catch(err => reject(err));
            })
        }); 


      
    }
    else
      reject("Requisição não possui sessão de usuário");
  })
}

module.exports = 
{
    GetConstrucoesPlaneta : GetConstrucoesPlaneta,
    getSetoresInfo : getSetoresInfo,
    GetUsuarioPlaneta : GetUsuarioPlaneta,
    GetCountCaixaDeEntrada : GetCountCaixaDeEntrada,
    GetUserData : getUserData
}