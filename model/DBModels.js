const sequalize = require ('sequelize')
const bcrypt = require('bcrypt')
const yargs = require('yargs').argv;
require('dotenv/config')

const totalX = Number(process.env.UNIVERSE_SIZE_X);
const totalY = Number(process.env.UNIVERSE_SIZE_Y);
var ready = false;
var readyToSync = false;
function GerarIntAleatorio(max, min)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


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
    host: process.env.DB_HOST, 
    dialect : 'mysql',
    operatorsAliases : false,
    timezone : 'Brazil/East',
    sync : {force : true},
    //logging: true,
    operatorsAliases: operatorsAlias,
    define:
    {
        collate : 'utf8_general_ci',
        charset : 'utf8'
    }
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
    },
    chave_ativacao :
    {
        type: sequalize.STRING,
        allowNull : false,
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
}, {timestamps : false});

const EsqueciSenha = con.define('esqueci_senha', 
{
    chave : 
    {
        type: sequalize.STRING,
        allowNull: false,
    },
    data_hora :
    {
        type: sequalize.DATE,
        allowNull : false,
        defaultValue : sequalize.NOW
    }
}, {timestamps : false, },);

//EsqueciSenha.hasOne(Usuario, {onDelete : "CASCADE", foreignKey:'usuarioID'});


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
    },
    posX :
    {
        type: sequalize.INTEGER,
        allowNull : false, 
    },
    posY : 
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    tamanho :
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    habitavel:
    {
        type:sequalize.BOOLEAN,
        allowNull : false
    },
    colonizado :
    {
        type:sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    recursoFerro :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0,
    },
    minaFerro :
    {
        type :  sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    }
    
}, {timestamps : false})


const Setor = con.define('Setor',
{
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome :
    {
        type: sequalize.STRING,
        allowNull : false,
    },
    posX :
    {
        type: sequalize.INTEGER,
        allowNull : false, 
    },
    posY : 
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    tamanho :
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    planetario :
    {
        type : sequalize.BOOLEAN,
        allowNull : false
    },
}, {timestamps : false});

const Sol = con.define("Sol",
{
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    luminosidade:
    {
        type : sequalize.INTEGER,
        allowNull : false
    },
    posX:
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    posY:
    {
        type: sequalize.INTEGER,
        allowNull : false,
    }
}, {timestamps : false});

const Asteroide = con.define("Asteroide", {
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    posX:
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    posY:
    {
        type: sequalize.INTEGER,
        allowNull : false,
    },
    extracao:
    {
        type: sequalize.BOOLEAN,
        allowNull: false,
        defaultValue : false
    }
}, {timestamps :false});

Usuario.afterDestroy(function(usuario, opcoes)
{
    con.query("update planeta set colonizado = 0, recursoFerro = 0, minaFerro = 0  where exists(select * from setors where setors.usuarioID = "+usuario.id+")").spread(function()
    {
        con.query("update asteroides set extracao = 0 where exists(select * from setors where setors.usuarioID = "+usuario.id+")").spread(function()
        {
            con.query("update setors set usuarioID = NULL where usuarioID = " + usuario.id);
        })
    });
});

Usuario.hasOne(EsqueciSenha, {foreignKey : {name : "usuarioID", allowNull : false, primaryKey : true}, onDelete : "CASCADE"})
EsqueciSenha.removeAttribute('id');
Setor.hasOne(Sol, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Setor.hasMany(Planeta, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Setor.hasMany(Asteroide, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Usuario.hasMany(Setor, {foreignKey : {name : "usuarioID", allowNull : true}, onDelete: "SET NULL"})

function CriarPlaneta(sol, numero, maximo, posicoestomadas, __callback)
{  
    if(numero > maximo)
    {
        Setor.findOne({where :{id : sol.setorID}}).then(function(setor)
        {
            __callback(sol, setor);
            return;
        });   
       
    }
    else
    {
        Setor.findOne({where :{id : sol.setorID}}).then(function(setor)
        {
            var posX;
            var posY;
            while(true)
            {
                var posSol = Math.ceil(setor.dataValues.tamanho / 2);
            
                posX = GerarIntAleatorio(setor.dataValues.tamanho, 0);
                posY = GerarIntAleatorio(setor.dataValues.tamanho, 0);
                if(posX == posSol && posY == posSol)
                {
                    continue;
                }
                var esta = false;
                for(var i = 0; i < posicoestomadas.length; i++)
                {
                    if(posicoestomadas[i].x == posX && posicoestomadas[i].y == posY)
                    {
                        esta = true;
                        break;
                    }
                }
                if(!esta)
                {
                    break;
                }
                
            }
            
            var tamanho = Math.floor(Math.random() * (150 - 110 + 1)) + 110;
            var valorHabitavel = Math.floor(Math.random() * (100 - 0 + 1)) + 0;
            var habitavel = (valorHabitavel <= process.env.UNIVERSE_SYSTEM_HABITABLE_PLANET_RATIO)
            Planeta.create({habitavel : habitavel, posX: posX, posY: posY, tamanho : tamanho, setorID : setor.id}).then(function()
            {
                posicoestomadas.push({x: posX, y: posY});
                var proximo = numero + 1;
    
                CriarPlaneta(sol, proximo, maximo, posicoestomadas, __callback);
            });
        
        });
    }
}




function PopularSetor(setor, __callback)
{
    if(setor.dataValues.planetario == true)
    {
        var posSol = Math.ceil(setor.dataValues.tamanho / 2);
        Sol.create({luminosidade : Math.floor(Math.random() * (150 - 30 + 1)) + 30, posX : posSol, posY: posSol, setorID : setor.dataValues.id}).then(function(sol)
        {
            var maximo = (setor.dataValues.planetario == true) ? GerarIntAleatorio(Number(process.env.UNIVERSE_SYSTEM_MAX_PLANETS), Number(process.env.UNIVERSE_SYSTEM_MIN_PLANETS)) : 0;
            CriarPlaneta(sol.dataValues, 1, maximo, [], __callback);
        });
    }
    else
    {
        var quantidadeAsteroids = GerarIntAleatorio(Number(process.env.UNIVERSE_ASTEROIDS_MAX), Number(process.env.UNIVERSE_ASTEROIDS_MIN));
        var posDisponiveis  = (setor.dataValues.tamanho * setor.dataValues.tamanho);
        if(quantidadeAsteroids > posDisponiveis)
        {
            quantidadeAsteroids = posDisponiveis;
        }
        CriarAsteroide(setor, 1,  quantidadeAsteroids, []);
    }
    
}


function CriarAsteroide(setorr,numero, maximo, posicoestomadas)
{
    if(numero > maximo)
    {
        ready = true;
        return;
    }
    var posX;
    var posY;
    while(true)
    {
        posX = GerarIntAleatorio(setorr.dataValues.tamanho, 0);
        posY = GerarIntAleatorio(setorr.dataValues.tamanho, 0);
        var esta = false;
        for(var i = 0; i < posicoestomadas.length; i++)
        {
            if(posicoestomadas.x == posX && posicoestomadas.y == posY)
            {
                esta = true;
                break;
            }
        }
        if(!esta)
        {
            break;
        } 
    }
    Asteroide.create({posX : posX, posY: posY, setorID : setorr.id}).then(function()
    {
        posicoestomadas.push({x: posX, y : posY});
        var proximo = numero + 1;

        CriarAsteroide(setorr, proximo, maximo, posicoestomadas);
    });
}


function PopularSetores()
{
    Setor.findAll({}).then(function(setores)
    {
        for(var i = 0; i < setores.length; i++)
        {
            var setor = setores[i];

            PopularSetor(setor, function(sol, setorr)
            {
                Planeta.findAll({where : {setorID : setorr.dataValues.id}, attributes : ['posX', 'posY']}).then(function(planetas)
                {
                   var quantidadeAsteroids = GerarIntAleatorio(Number(process.env.UNIVERSE_ASTEROIDS_MAX), Number(process.env.UNIVERSE_ASTEROIDS_MIN));
                   var posDisponiveis  = (setorr.dataValues.tamanho * setorr.dataValues.tamanho)  - planetas.length - 1;
                   if(quantidadeAsteroids > posDisponiveis)
                   {
                       quantidadeAsteroids = posDisponiveis;
                   }

                   var posicoes  = new Array();
                   posicoes.push({x: sol.posX, y: sol.posY});
                   for(var j = 0; j < planetas.length; j++)
                   {
                       posicoes.push({x : planetas[j].dataValues.posX, y : planetas[j].dataValues.posY});
                   }
                    
                    CriarAsteroide(setorr, 1,  quantidadeAsteroids, posicoes);
                });
            });

            
        }
    });
}


function gerarSetores(posX, posY)
{
    if(posX > totalX)
    {
        PopularSetores();
    }
    else
    {
        var aumentarX = (posY == totalY);
        var aumentarY = (!aumentarX);
        var valorPlanetario = GerarIntAleatorio(100, 0);
        var planetario = (valorPlanetario <= process.env.UNIVERSE_SYSTEM_PROB)
        Setor.create({
            posY: posY,
            posX: posX,
            nome : "Setor " + posX + "-" + posY,
            tamanho: Math.floor(Math.random() * (15 - 7 + 1)) + 7, 
            planetario : planetario
        }).then(function(setor)
        {
            if(aumentarX)
            {
                posX++
                posY = 1;
            }
            else if(aumentarY)
            {
                posY++;
            }
            else
            {
                return;
            }
            gerarSetores(posX, posY);
        }).catch(function(err)
        {
            console.error(err);
        });
        
    }
    
}
module.exports = {Con : con, Usuario :  Usuario, Admin : Admin, EsqeciSenha : EsqueciSenha, Setor : Setor, Planeta : Planeta, isReady : function(){return ready;}};
function SyncDatabase()
{
    Usuario.sync({force : yargs.create}).then(function()
    {
        EsqueciSenha.sync({force : yargs.create})
        Admin.sync({force : yargs.create}).then(function()
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
                    Setor.sync({force: yargs.create}).then(function()
                    {
                        Sol.sync({force: yargs.create}).then(function()
                        {
                            Planeta.sync({force : yargs.create}).then(function()
                            {
                                Asteroide.sync({force : yargs.create}).then(function()
                                {
                                    if(yargs.create)
                                        gerarSetores(1, 1);
                                    else
                                    {
                                        ready = true;
                                    }
                                }); 
                            });
                        });  
                    });
                }); 
            });    
        });
    }).catch(function(err)
    {
        if(yargs.create)
            setTimeout(SyncDatabase, 3000);
        else
            console.error(err);
    });
    
}

function ClearForeignKeys(erro)
{
    const queryInterface = con.getQueryInterface();
        queryInterface.showAllTables().then(tableNames => {
        Promise.all(tableNames.map(tableName => {
            queryInterface.showConstraint(tableName).then(constraints => {
                Promise.all(constraints.map(constraint => {
                    if (constraint.constraintType === 'FOREIGN KEY') {
                        queryInterface.removeConstraint(tableName, constraint.constraintName);
                    }
                }))
            })
        }));
    })
}

con.authenticate().then(function()
{
    console.log("Conexao Criada");
    
    if(yargs.create)
    {
        ClearForeignKeys();
    }
    
    SyncDatabase();
    
    

}).catch(function(err)
{
    console.log(err.parent);
});


