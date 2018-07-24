const sequalize = require ('sequelize')
const bcrypt = require('bcrypt')
require('dotenv/config')
const Op = sequalize.Op;
const operatorsAlias = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
  };


const con = new sequalize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host:'localhost', 
    dialect : 'mysql',
    operatorsAliases : false,
    timezone : 'Brazil/East',
    sync : {force : true},
    //logging: true,
    operatorsAliases: operatorsAlias 
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
    ferias:
    {
        type:sequalize.BOOLEAN,
        allowNull : false,
        defaultValue: false
    },
    feriasAtivacao:
    {
        type:sequalize.TIME,
        allowNull : true
    },
    banido :
    {
        type : sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    ativo : 
    {
        type : sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    }
});

const Admin = con.define("admin", {
    id: 
    {
        type: sequalize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    usuario: 
    {
        type:sequalize.STRING,
        unique : true,
        allowNull : false
    },
    senha: 
    {
        type:sequalize.STRING,
        allowNull : false,
    },
}, {timestamps : false})


const Planeta = con.define('Planeta', 
{
    id : 
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome :
    {
        type: sequalize.STRING,
        allowNull : false,
        defaultValue: "Planeta",
    }

})


Usuario.hasMany(Planeta);
Usuario.afterCreate(function(usuario, opcoes)
{
    Planeta.create({UsuarioId: usuario.dataValues.id})
});
con.authenticate().then(function()
{
    console.log("Conexao Criada");
    Usuario.sync({force : false});
    Admin.sync({force : false}).then(function()
    {
        bcrypt.hash(process.env.GAME_DEFAULT_ADMIN_PASSWORD, 10, function(err, hash)
        {
            if(err) throw err
            Admin.count({}).then(function(contagem)
            {
                if(contagem == 0)
                {
                    Admin.create({usuario : process.env.GAME_DEFAULT_ADMIN_USERNAME, senha : hash});
                }
            });
            
        });
        
    });
    Planeta.sync({force : false})

}).catch(function(err)
{
    console.log(err.parent);
});

module.exports = {Con : con, Usuario : Usuario, Admin : Admin};
