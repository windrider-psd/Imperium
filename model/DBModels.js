const sequalize = require ('sequelize')
const con = new sequalize('Imperium', 'root', '', {
    host:'localhost', 
    dialect : 'mysql',
    operatorsAliases : false,
    timezone : 'Brazil/East',
    sync : {force : true},
    logging: false
    });

const Usuario = con.define('Usuario', {
    id : {
        type : sequalize.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    nick : 
    {
        type:sequalize.STRING,
        unique : true,
        allowNull : false,
        validate:
        {
            min: 4
        }
    },
    email :
    {
        type: sequalize.STRING,
        unique : true,
        allowNull : false
    },
    senha: 
    {
        type:sequalize.STRING,
        allowNull : false,
    },
    ativo : 
    {
        type : sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    }
});


con.authenticate().then(function()
{
    console.log("Conexao Criada");
    Usuario.sync({force : true});

}).catch(function(err)
{
    console.log("conexao não criada");
});

module.exports = {Con : con, Usuario : Usuario};
