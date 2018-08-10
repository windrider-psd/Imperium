const models = require('./DBModels');
var BlueBird = require('bluebird');

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


module.exports = 
{
    GetConstrucoesPlaneta : GetConstrucoesPlaneta,
    getSetoresInfo : getSetoresInfo,
    GetUsuarioPlaneta : GetUsuarioPlaneta
}