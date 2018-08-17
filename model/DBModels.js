const sequalize = require ('sequelize')

require('dotenv/config')
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
    },
    pontosPesquisa :
    {
        type: sequalize.DOUBLE,
        allowNull : false,
        defaultValue : 0
    },
    pontosEconomia :
    {
        type: sequalize.DOUBLE,
        allowNull : false,
        defaultValue : 0
    },
    pontosMilitar :
    {
        type: sequalize.DOUBLE,
        allowNull : false,
        defaultValue : 0
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
    },
    armazem : 
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
    edificioID:
    {
        type:sequalize.TINYINT,
        allowNull : false,
        primaryKey : true,
    },
    inicio:
    {
        type: sequalize.DATE,
        allowNull : false,
        defaultValue : sequalize.NOW,
    },
    duracao:
    {
        type:sequalize.INTEGER,
        allowNull : false
    }
}, {timestamps : false});

const MensagemPrivada = con.define("Mensagem_Privada",{
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    remetente:
    {
        type: sequalize.INTEGER,
        references:
        {
            model : Usuario,
            key: 'id'
        },
        allowNull : false,
        onDelete : 'CASCADE',
    },
    excluidoRemetente:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    destinatario:
    {
        type: sequalize.INTEGER,
        references:
        {
            model : Usuario,
            key : 'id'
        },
        allowNull : false,
        onDelete : 'CASCADE'
    },
    excluidoDestinatario:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    assunto : 
    {
        type : sequalize.STRING,
        allowNull : false,
        defaultValue : "Sem assunto",
        validate:
        {
            max : Number(process.env.MESSAGE_SUBJECT_MAX_LENGTH)
        }
    },
    mensagem :
    {
        type: sequalize.TEXT,
        allowNull : false,
        validate:
        {
            max : Number(process.env.MESSAGE_CONTENT_MAX_LENGTH)
        }
    },
    visualizada:
    {
        type: sequalize.BOOLEAN,
        defaultValue : false,
        allowNull :false
    },
    criacao :
    {
        type : sequalize.DATE,
        defaultValue : sequalize.NOW,
        allowNull : false
    } 
}, {timestamps : false});


const Alianca = con.define('alianca', {
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome:
    {
        type: sequalize.STRING,
        allowNull : false
    },
    tag:
    {
        type:sequalize.STRING,
        allowNull : false
    },
    logo : 
    {
        type : sequalize.STRING,
        allowNull : true,
    },
    paginaInterna :
    {
        type: sequalize.TEXT,
        allowNull : true,
    },
    paginaExterna :
    {
        type: sequalize.TEXT,
        allowNull : true
    },
    lider:
    {
        type: sequalize.INTEGER,
        allowNull : true,
        references :
        {
            model : Usuario,
            key : 'id',
        },
        onDelete : "SET NULL",
        defaultValue : null
    },
    sucessor : 
    {
        type: sequalize.INTEGER,
        allowNull : true,
        references :
        {
            model : Usuario,
            key : 'id',
        },
        onDelete : "SET NULL",
        defaultValue : null
    },
    aplicacao_template :
    {
        type: sequalize.TEXT,
        allowNull : true,
        defaultValue : null
    }
}, {timestamps : false});


const Alianca_Aplicacao = con.define('alianca_aplicacao', {
    usuarioID :
    {
        type: sequalize.INTEGER,
        allowNull : false,
        references :
        {
            model : Usuario,
            key : 'id',
        },
        primaryKey : true,
        onDelete : "CASCADE"
    },
    aliancaID :
    {
        type: sequalize.INTEGER,
        allowNull : false,
        references :
        {
            model : Alianca,
            key : 'id',
        },
        onDelete : "CASCADE"
    },
    texto :
    {
        type: sequalize.TEXT,
        allowNull : false,
        defaultValue : ""
    },

}, {timestamps : false})

const Alianca_Rank = con.define('alianca_ranks', {
    id:
    {
        type: sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    aliancaID : 
    {
        type: sequalize.INTEGER,
        allowNull : true,
        references :
        {
            model : Alianca,
            key : 'id',
        },
        onDelete : "CASCADE"
    },
    nome:
    {
        type: sequalize.STRING,
        allowNull : false,
    },
    ver_aplicacoes:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    aceitar_aplicacoes:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    expulsar:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    mensagens:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    online:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    tratados:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    frota:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false,
    },
    exercito:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    movimento:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    ranks_criar:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    ranks_atribuir:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    forum_tabs:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },
    forum_topicos:
    {
        type: sequalize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    }

}, {timestamps : false});

const Usuario_Participa_Alianca = con.define('usuario_participa_alianca', {
    usuarioID:
    {
        type: sequalize.INTEGER,
        allowNull : false,
        references :
        {
            model : Usuario,
            key : 'id',
        },
        onDelete : "CASCADE",
        unique : true,
        primaryKey : true,
    },
    aliancaID:
    {
        type: sequalize.INTEGER,
        allowNull : false,
        references :
        {
            model : Alianca,
            key : 'id',
        },
        primaryKey : true,
        onDelete : "CASCADE",
    },
    rank:
    {
        type: sequalize.INTEGER,
        allowNull : true,
        references :
        {
            model : Alianca_Rank,
            key : 'id',
        },
        onDelete : "SET NULL",
    },
    entrada :
    {
        type : sequalize.DATE,
        allowNull : false,
        defaultValue : sequalize.NOW
    }

}, {timestamps : false});



Usuario.hasOne(EsqueciSenha, {foreignKey : {name : "usuarioID", allowNull : false, primaryKey : true}, onDelete : "CASCADE"})
EsqueciSenha.removeAttribute('id');
Setor.hasMany(Planeta, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Setor.hasMany(Asteroide, {foreignKey : {name : "setorID", allowNull : false}, onDelete : "CASCADE"})
Usuario.hasMany(Setor, {foreignKey : {name : "usuarioID", allowNull : true}, onDelete: "SET NULL"})
Planeta.hasMany(Construcao,  {foreignKey : {name : "planetaID", allowNull : false, primaryKey : true}, onDelete: "CASCADE"})

//Reseta os attributos dos planetas e asteroides do usuario após o usuário ser apagado da base de dados
Usuario.afterDestroy(function(usuario)
{
    con.query("update planeta set colonizado = 0, minaCristal = 0, fabricaEletronica = 0, minaUranio = 0, sintetizadorCombustivel = 0, fazenda = 0 ,recursoFerro = 0, minaFerro = 0, recursoCristal = 0, recursoEletronica = 0, recursoUranio = 0, recursoCombustivel = 0, recursoComida = 0 plantaSolar = 0, reatorFusao = 0, armazem = 0  where exists(select * from setors where setors.usuarioID = "+usuario.id+")").spread(function()
    {
        con.query("update asteroides set extracao = 0 where exists(select * from setors where setors.usuarioID = "+usuario.id+")").spread(function()
        {
            con.query("update setors set usuarioID = NULL where usuarioID = " + usuario.id);
        })
    });
});


MensagemPrivada.afterUpdate((instancia) => {
    if(instancia.excluidoDestinatario == true && instancia.excluidoRemetente)
        instancia.destroy();
})

module.exports = {
    Con : con, 
    MensagemPrivada : MensagemPrivada, 
    Alianca: Alianca,  
    Usuario_Participa_Alianca : Usuario_Participa_Alianca,
    Alianca_Rank: Alianca_Rank,
    Asteroide : Asteroide, 
    Usuario :  Usuario,
    Admin : Admin, 
    EsqeciSenha : EsqueciSenha,
    Setor : Setor, 
    Planeta : Planeta,
    Construcao : Construcao, 
    Alianca_Aplicacao : Alianca_Aplicacao,
    isReady : function(){return ready;}};

con.authenticate().then(function()
{
    console.log("Conexao Criada");
    ready = true;
}).catch(function(err)
{
    console.log(err.parent);
});



