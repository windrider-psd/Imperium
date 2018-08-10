var models = require('./DBModels')

/**
 * @typedef TRecursos
 * @property {number} [ferro]
 * @property {number} [cristal]
 * @property {number} [uranio]
 * @property {number} [comida]
 * @property {number} [pessoas] Recursos humanos
 * @property {number} [eletronica]
 * @property {number} [combustivel]
 */
 
/**
 * @typedef TTipoPontos
 * @property {string} pontosMilitar
 * @property {string} pontosEconomia
 * @property {string} pontosPesquisa
 */

/**
 * @type {TTipoPontos}
 */
var TipoPontos = Object.freeze({"pontosMilitar" : "pontosMilitar", "pontosEconomia" : "pontosEconomia", "pontosPesquisa": "pontosPesquisa"});

/**
 * @type {number}
 * @description A quantidades de recursos gastos necessários para se ganhar 1 ponto.
 */
const recursosParaPontos = 1000;


/**
 * 
 * @param {Number | Array} user O id do usuário ou o objeto sequelize dele
 * @param {TRecursos} recursos Os recursos gastos na ação
 * @param {TTipoPontos} tipo O tipo de pontos que serão adicionados
 * @description Adiciona pontos para o usuário
 * @returns {void}
 */

function AdicionarPontos(user, recursos, tipo)
{
    let pontos = 0;
    for(let chave in recursos)
    {
        pontos += recursos[chave] / recursosParaPontos;
    }

    if(typeof(user) == 'number')
    {
        models.Usuario.findOne({where : {id : user}}).then((usuario) =>{
            if(usuario)
            {
                let updateObj = {};
                updateObj[TipoPontos[tipo]] = pontos + usuario[TipoPontos[tipo]];
                models.Usuario.update(updateObj, {where : {id : usuario.id}, limit : 1}).catch((err) => {
                    console.log(err);
                })
            }
            else
            {
                console.log("Usuário não encontrado para adição de pontos");
            }
        });
    }
    else if(typeof(user) == 'object')
    {
        let updateObj = {};
        updateObj[TipoPontos[tipo]] = pontos + user[TipoPontos[tipo]];
        models.Usuario.update(updateObj, {where : {id : user.id}, limit : 1}).catch((err) => {
            console.log(err);
        })
    }
}

module.exports = {
    TipoPontos : TipoPontos,
    AdicionarPontos : AdicionarPontos
}