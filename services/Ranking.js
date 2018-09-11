const models = require('./../model/DBModels')
const Bluebird = require('bluebird');
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
 * @typedef UsuarioRank
 * @property {number} id
 * @property {number} rank
 * @property {number} desempenho Ainda não está implementado
 * @property {string} nome
 * @property {number} pontos
 * @property {Object} alianca
 * @property {number} alianca.id
 * @property {string} alianca.nome
 * @property {string} alianca.tag
*/

/**
 * @type {TTipoPontos}
 */
const TipoPontos = Object.freeze({"pontosMilitar" : "pontosMilitar", "pontosEconomia" : "pontosEconomia", "pontosPesquisa": "pontosPesquisa"});

/**
 * @type {number}
 * @description A quantidades de recursos gastos necessários para se ganhar 1 ponto.
 */
const recursosParaPontos = 1000;

/**
 * 
 * @param {TTipoPontos} tipo O tipo da pontuação 
 * @param {number} [offset]
 * @param {number} [limit]
 * @description Gera a String SQL necessário para encontrar e ordenar rankings de usuários. Offset e limit em conjunto são opcionas.
 * @returns {{sql : string, sqlPontos : Array.<string>}}
 */
function MontarSQLSelectPontosUsuario(tipo, offset, limit)
{
     /**@type {Array.<string>} */
     let sqlPontos = new Array();
     if(tipo == 'pontosTotal')
     {
         for(let chave in TipoPontos)
             sqlPontos.push(TipoPontos[chave]);
     }
     else
     {
         for(let chave in TipoPontos)
         {
             if(tipo == TipoPontos[chave])
             {
                 sqlPontos.push(TipoPontos[chave]);
                 break;
             }
         }
         if(sqlPontos.length == 0)
         {
             reject("Tipo de pontos não existe");
             return;
         }
     }

     let orderString = "";
     for(let i = 0; i < sqlPontos.length; i++)
     {
         orderString += "usuarios."+sqlPontos[i];
         if(i == sqlPontos.length - 1)
             break;
         else
             orderString += " + ";
     }
     let sqlString = "SELECT * FROM `usuarios` ORDER BY("+orderString+") DESC"
     if(typeof(offset) !== 'undefined' && typeof(limit) !== 'undefined')
        sqlString += " limit " + limit + " offset " + offset
     
     return {sql : sqlString, sqlPontos : sqlPontos};
}


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
 * @param {number} offset O offset de usuários
 * @param {number} limit O total de usuários que serão rankeados
 * @param {TTipoPontos} tipo O tipo dos pontos que se procura
 * @description Retorna uma array de tipo UsuarioRank dos usuários selecionados de acordo com os parâmetros offset e limit
 * @returns {Bluebird.<Array.<UsuarioRank>>}
 */
function GetRankings(offset, limit, tipo)
{
    return new Bluebird((resolve, reject) => {
        if(typeof(offset) !== 'number' || typeof(limit) !== 'number')
        {
            reject("Offset e limite precisam ser números");
        }
        else
        {
           let sql = MontarSQLSelectPontosUsuario(tipo, offset, limit);
            models.Con.query(sql.sql).spread((usuarios) => {

                let promessasAll = new Array();
                for(let i = 0; i < usuarios.length; i++)
                {
                    promessasAll.push(new Bluebird(resolve => {
                        let index = i;
                        let pontos = 0;
                        for(let j = 0; j < sql.sqlPontos.length; j++)
                            pontos += usuarios[index][sql.sqlPontos[j]];
                        
                        models.Usuario_Participa_Alianca.findOne({where : {usuarioID : usuarios[index].id}, attributes :['usuarioID', 'aliancaID']}).then(participa => {
                            if(!participa)
                                resolve({id : usuarios[index].id, nome: usuarios[index].nick, pontos : pontos, alianca : undefined, desempenho : undefined, rank : index + 1 + offset})
                            else
                            {
                                models.Alianca.findOne({where : {id : participa.aliancaID}, attributes :['id', 'nome', 'tag']}).then(alianca => 
                                    resolve({id : usuarios[index].id, nome: usuarios[index].nick, pontos : pontos, alianca : {id : alianca.id, nome : alianca.nome, tag : alianca.tag} , desempenho : undefined, rank : index + 1 + offset})
                                )
                            }
                        })

                    }));
                }
                Bluebird.all(promessasAll).then(resultado => resolve(resultado))
            }).catch((err) => {reject(err)});
        }
    }); 
}

/**
 * 
 * @param {number} idusuario O id usuario
 * @param {TTipoPontos} [tipo=pontosTotal] O tipo dos pontos que se procura
 * @description Descobre Qual é o ranking do jogador
 * @returns {Bluebird<any>} O ranking do jogador
 */
function GetRankingUsuario(idusuario, tipo = "pontosTotal")
{
    return new Bluebird((resolve, reject) =>{
        if(typeof(idusuario) !== 'number')
        {
            reject("O idusuario precisa ser um número");
        }
        
        models.Con.query(MontarSQLSelectPontosUsuario(tipo, 0).sql).spread((usuarios) => {
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
    GetRankingUsuario : GetRankingUsuario,
    GetRankings : GetRankings
}