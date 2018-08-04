const models = require('./DBModels');
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

/**
 * @param {Object[]} setores A array dos setores de modelo Sequelize
 * @description Extrai informações dos setores (planetas e construções)
 * @param {Function} callback callback(resultado : Array)
 */
async function GetInfoSetores(setores, callback)
{
  let resultado = new Array();
  for(let i = 0; i < setores.length; i++)
  {
      await models.Planeta.findAll({where : {setorID : setores[i].id}}).then((planetas) =>
      {
        let resPush = {setor : setores[i].dataValues, planetas :[]};
        for(let j = 0; j < planetas.length; j++)
        {
            let encontrarFunction = function(planeta)
            {
                GetConstrucoesPlaneta(planeta.id, (construcoes) =>
                {
                    planeta.construcoes = construcoes;
                    resPush.planetas.push(planeta);
                    if(j == planetas.length - 1)
                    {
                        resultado.push(resPush);
                        if(i == setores.length - 1)
                        {
                            callback(resultado);
                        }
                    }
                })
            }
            encontrarFunction(planetas[j].dataValues);        
        }
      }); 
  }
}

module.exports = 
{
    GetInfoSetores : GetInfoSetores,
    GetConstrucoesPlaneta : GetConstrucoesPlaneta
}