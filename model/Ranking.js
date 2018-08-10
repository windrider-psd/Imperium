var models = require('./DBModels')
var Bluebird = require('bluebird');
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

/**
 * 
 * @param {number} idusuario O id usuario
 * @description Descobre Qual é o ranking do jogador
 * @returns {Bluebird<any>} O ranking do jogador
 */
function GetRankingUsuario(idusuario)
{
    return new Bluebird((resolve, reject) =>{
        if(typeof(idusuario) !== 'number')
        {
            reject("O idusuario precisa ser um número");
        }
        models.Con.query("SELECT id FROM `usuarios` ORDER BY(usuarios.pontosPesquisa + usuarios.pontosEconomia + usuarios.pontosMilitar) DESC").spread((usuarios) => {
            if(usuarios.length == 0)
                reject("Nenhum usuário cadastrado");
            else
            {
                let esta = false;
                for(let i = 0; i < usuarios.length; i++)
                {
                    if(usuarios[i].id == idusuario)
                    {
                        resolve(i + 1);
                        esta = true;
                        break;
                    }
                }
                if(!esta)
                    reject("Usuário não encontrado");
            }
            
        }).catch((err) => {reject(err)});
    });
    
}

module.exports = {
    TipoPontos : TipoPontos,
    AdicionarPontos : AdicionarPontos,
    GetRankingUsuario : GetRankingUsuario
}