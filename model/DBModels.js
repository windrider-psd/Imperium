const sequalize = require ('sequelize')
const bcrypt = require('bcrypt')
const yargs = require('yargs').argv;
const random = require('./Aleatorio');
require('dotenv/config')

const totalX = Number(process.env.UNIVERSE_SIZE_X);
const totalY = Number(process.env.UNIVERSE_SIZE_Y);
var ready = false;


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
        type: sequalize.BIGINT,
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
    recursoCristal :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0,
    },
    recursoEletronica :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0,
    },
    recursoUranio :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0,
    },
    recursoCombustivel :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0,
    },
    recursoComida :
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
    },
    minaCristal :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    fabricaEletronica :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    minaUranio :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    sintetizadorCombustivel :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    fazenda :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    plantaSolar :
    {
        type : sequalize.INTEGER,
        allowNull : false,
        defaultValue : 0
    },
    reatorFusao : 
    {
        type : sequalize.INTEGER,
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
    intensidadeSolar:
    {
        type : sequalize.INTEGER,
        allowNull : true,
    },
    solPosX :
    {
        type: sequalize.INTEGER,
        allowNull : true,
    },
    solPosY :
    {
        type: sequalize.INTEGER,
        allowNull : true,
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

const Construcao = con.define("Construcao", {
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    edificio:
    {
        type:sequalize.STRING,
        allowNull : false
    },
    inicio:
    {
        type: sequalize.DATE,
        allowNull : false,
        defaultValue : sequalize.NOW
    },
    duracao:
    {
        type:sequalize.INTEGER,
        allowNull : false
    }
}, {timestamps : false});


Usuario.hasOne(EsqueciSenha, {foreignKey : {name : "usuarioID", allowNull : false, primaryKey : true}, onDelete : "CASCADE"})
EsqueciSenha.removeAttribute('id');
Setor.hasMany(Planeta, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Setor.hasMany(Asteroide, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Usuario.hasMany(Setor, {foreignKey : {name : "usuarioID", allowNull : true}, onDelete: "SET NULL"})
Planeta.hasMany(Construcao,  {foreignKey : {name : "planetaID", allowNull : false}, onDelete: "CASCADE"})

//Popula o setor depois de sua criacao
Setor.afterCreate((instancia) =>
{
    PopularSetor(instancia);
}
)

//Reseta os attributos dos planetas e asteroides do usuario após o usuário ser apagado da base de dados
Usuario.afterDestroy(function(usuario, opcoes)
{
    con.query("update planeta set colonizado = 0, minaCristal = 0, fabricaEletronica = 0, minaUranio = 0, sintetizadorCombustivel = 0, fazenda = 0 ,recursoFerro = 0, minaFerro = 0, recursoCristal = 0, recursoEletronica = 0, recursoUranio = 0, recursoCombustivel = 0, recursoComida = 0 plantaSolar = 0, reatorFusao = 0  where exists(select * from setors where setors.usuarioID = "+usuario.id+")").spread(function()
    {
        con.query("update asteroides set extracao = 0 where exists(select * from setors where setors.usuarioID = "+usuario.id+")").spread(function()
        {
            con.query("update setors set usuarioID = NULL where usuarioID = " + usuario.id);
        })
    });
});

/**
 * @param {object} setor O Modelo do tipo sequelize do setor 
 * @param {number} posX A posicao do eixo X do planeta
 * @param {number} posY A posicao do eixo Y do planeta
 */
function CriarPlaneta(setor, posX, posY)
{
    var tamanho = random.GerarIntAleatorio(Number(process.env.UNIVERSE_PLANET_MAX_SIZE), Number(process.env.UNIVERSE_PLANET_MIN_SIZE));
    var valorHabitavel = random.GerarIntAleatorio(100, 0);
    var habitavel = (valorHabitavel <= process.env.UNIVERSE_SYSTEM_HABITABLE_PLANET_RATIO)
    Planeta.create({habitavel : habitavel, posX: posX, posY: posY, tamanho : tamanho, setorID : setor.id}).catch((err) =>
    {
        if(err.name == "TimeoutError")
        {
            setTimeout(() =>
            {
                CriarPlaneta(setor, posX, posY);
            }, 100);
        }
        else
        {
            console.log('\x1b[31m%s\x1b[0m', err);
        }
        
    });
}

/**
 * @param {object} setor O Modelo do tipo sequelize do setor 
 * @param {number} posX A posicao do eixo X do asteroide
 * @param {number} posY A posicao do eixo Y do asteroide
 */
function CriarAsteroide(setor, posX, posY)
{
    Asteroide.create({posX : posX, posY: posY, setorID : setor.id}).catch((err) =>{
        if(err.name == "TimeoutError")
        {
            setTimeout(()=>
            {
                CriarAsteroide(setor, posX, posY);
            }, 100);
        }
        else
        {
            console.log('\x1b[31m%s\x1b[0m', err);
        }
    });
}

/**
 * @param {number} posX A posição do eixo X do setor
 * @param {number} posY A posição do eixo Y do setor
 * @description Cria um setor dada o vetor [posX, posY]
 */
function CriarSetor(posX, posY)
{
    let valorPlanetario = random.GerarIntAleatorio(100, 0);
    let planetario = (valorPlanetario <= process.env.UNIVERSE_SYSTEM_PROB)
    let tamanho = random.GerarIntAleatorio(Number(process.env.UNIVERSE_SYSTEM_MAX_SIZE), Number(process.env.UNIVERSE_SYSTEM_MIN_SIZE));
    Setor.create({
        posY: posY,
        posX: posX,
        nome : "Setor " + posX + "-" + posY,
        tamanho: tamanho, 
        planetario : planetario,
        intensidadeSolar : (planetario) ? random.GerarIntAleatorio(200, 70) : null,
        solPosX : (planetario) ? Math.ceil (tamanho / 2) : null,
        solPosY : (planetario) ? Math.ceil (tamanho / 2)  : null
    }).catch((err) =>
    {
        if(err.name == "TimeoutError")
        {
            setTimeout(() =>
            {
                CriarSetor(posX, posY);
            }, 100);
        }
        else
        {
            console.log('\x1b[31m%s\x1b[0m', err);
        }
    });
}

/**
 * @param {object} setor O modelo sequelize do setor
 * @description Popula o setor fornecido com asteroides e planetas (se é um setor planetário)
 */
function PopularSetor(setor)
{
    var posicoesTomadas = new Array(); //Array que armazeda posições de objetos de setor já tomadas

    /**
     * @param {number} x //A posicao do eixo X
     * @param {number} y //A posicao do eixo Y
     * @description Retorna se o vetor de x e y já está tomada na variável de posicoes tomadas
     * @returns {boolean}
     */
    var isPosicaoTomada = function(x, y)
    {
        for(let i = 0; i < posicoesTomadas.length; i++)
        {
            if(posicoesTomadas[i].x == x && posicoesTomadas[i].y == y)
                return true
        }
        return false
    }

    //Se o setor for planetario, ira criar o planetas antes dos anteroides
    if(setor.planetario == true)
    {   
        //A posição do sol do setor
        var posSol = Math.ceil(setor.tamanho / 2);
        posicoesTomadas.push({x : posSol, y : posSol}); 
        
        //Total de planetas
        var maximo = random.GerarIntAleatorio(Number(process.env.UNIVERSE_SYSTEM_MAX_PLANETS), Number(process.env.UNIVERSE_SYSTEM_MIN_PLANETS));
        if(maximo > (setor.tamanho * setor.tamanho) - 1)
        {
            maximo = (setor.tamanho * setor.tamanho) - 1;
        }

        for(let i = 0; i < maximo; i++)
        {
            let posX;
            let posY;
            do
            {
                posX = random.GerarIntAleatorio(setor.tamanho, 0);
                posY = random.GerarIntAleatorio(setor.tamanho, 0);
            }while(isPosicaoTomada(posX, posY))

            posicoesTomadas.push({x : posX, y : posY});
            CriarPlaneta(setor, posX, posY);
        }
    }

    //total de asteroides que serão criados
    var quantidadeAsteroids = random.GerarIntAleatorio(Number(process.env.UNIVERSE_ASTEROIDS_MAX), Number(process.env.UNIVERSE_ASTEROIDS_MIN));
    quantidadeAsteroids = (quantidadeAsteroids > posicoesTomadas.length) ? quantidadeAsteroids : posicoesTomadas.length

    for(let i = 0; i < quantidadeAsteroids; i++)
    {
        let posX;
        let posY;
        do
        {
            posX = random.GerarIntAleatorio(setor.tamanho, 0);
            posY = random.GerarIntAleatorio(setor.tamanho, 0);
        }while(isPosicaoTomada(posX, posY))

        posicoesTomadas.push({x : posX, y : posY});
        CriarAsteroide(setor, posX, posY);
    }
}



/**
 * @description Cria os setores do universo.
 */
function gerarSetores()
{
    for(let posX = 0; posX < process.env.UNIVERSE_SIZE_X; posX++)
    {
        for(let posY = 0; posY < process.env. UNIVERSE_SIZE_Y; posY++)
        {
            CriarSetor(posX, posY);
        }
    }
}
module.exports = {Con : con, Usuario :  Usuario, Admin : Admin, EsqeciSenha : EsqueciSenha, Setor : Setor, Planeta : Planeta, Construcao : Construcao, isReady : function(){return ready;}};
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
                        Planeta.sync({force : yargs.create}).then(function()
                        {
                            Asteroide.sync({force : yargs.create}).then(function()
                            {

                                Construcao.sync({force : yargs.create}).then(() =>
                                {
                                    if(yargs.create)
                                    {
                                        gerarSetores();
                                        ready = true;
                                    }
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

/**
 *  @description Apaga todas as constrains da base de dados
 */
function ClearForeignKeys()
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


