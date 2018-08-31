
const models = (require("./DBModels.js"));
const random = (require("./Aleatorio.js"));
const bcrypt = require('bcrypt')
require('dotenv/config');
class DBBuilder {
    constructor() { }
    /**
     * @param {any} setor O Modelo do tipo sequelize do setor
     * @param {number} posX A posicao do eixo X do planeta
     * @param {number} posY A posicao do eixo Y do planeta
     */
    static CriarPlaneta(setor, posX, posY) {
        let tamanho = random.GerarIntAleatorio(Number(process.env.UNIVERSE_PLANET_MAX_SIZE), Number(process.env.UNIVERSE_PLANET_MIN_SIZE));
        let valorHabitavel = random.GerarIntAleatorio(100, 0);
        let habitavel = (valorHabitavel <= Number(process.env.UNIVERSE_SYSTEM_HABITABLE_PLANET_RATIO));
        models.Planeta.create({ habitavel: habitavel, posX: posX, posY: posY, tamanho: tamanho, setorID: setor.id }).catch((err) => {
            if (err.name == "TimeoutError") {
                    this.CriarPlaneta(setor, posX, posY);
            }
            else {
                console.log('\x1b[31m%s\x1b[0m', err);
            }
        });
    }
    /**
     * @param {any} setor O Modelo do tipo sequelize do setor
     * @param {number} posX A posicao do eixo X do asteroide
     * @param {number} posY A posicao do eixo Y do asteroide
     */
    static CriarAsteroide(setor, posX, posY) {
        models.Asteroide.create({ posX: posX, posY: posY, setorID: setor.id }).catch((err) => {
            if (err.name == "TimeoutError") {
                this.CriarAsteroide(setor, posX, posY);
            }
            else {
                console.log('\x1b[31m%s\x1b[0m', err);
            }
        });
    }
    /**
     * @param {number} posX A posição do eixo X do setor
     * @param {number} posY A posição do eixo Y do setor
     * @description Cria um setor dada o vetor [posX, posY]
     */
    static CriarSetor(posX, posY) {
        let valorPlanetario = random.GerarIntAleatorio(100, 0);
        let planetario = (valorPlanetario <= Number(process.env.UNIVERSE_SYSTEM_PROB));
        let tamanho = random.GerarIntAleatorio(Number(process.env.UNIVERSE_SYSTEM_MAX_SIZE), Number(process.env.UNIVERSE_SYSTEM_MIN_SIZE));
        models.Setor.create({
            posY: posY,
            posX: posX,
            nome: "Setor " + posX + "-" + posY,
            tamanho: tamanho,
            planetario: planetario,
            intensidadeSolar: (planetario) ? random.GerarIntAleatorio(200, 70) : null,
            solPosX: (planetario) ? Math.ceil(tamanho / 2) : null,
            solPosY: (planetario) ? Math.ceil(tamanho / 2) : null
        }).catch((err) => {
            if (err.name == "TimeoutError") {
                this.CriarSetor(posX, posY);
            }
            else {
                console.log('\x1b[31m%s\x1b[0m', err);
            }
        });
    }
    /**
     * @param {any} setor O modelo sequelize do setor
     * @description Popula o setor fornecido com asteroides e planetas (se é um setor planetário)
     */
    static PopularSetor(setor) {
        var posicoesTomadas = new Array(); //Array que armazeda posições de objetos de setor já tomadas
        /**
         * @param {number} x //A posicao do eixo X
         * @param {number} y //A posicao do eixo Y
         * @description Retorna se o vetor de x e y já está tomada na variável de posicoes tomadas
         * @returns {boolean}
         */
        let isPosicaoTomada = (x, y) => {
            for (let i = 0; i < posicoesTomadas.length; i++) {
                if (posicoesTomadas[i].x == x && posicoesTomadas[i].y == y)
                    return true;
            }
            return false;
        };
        //Se o setor for planetario, ira criar o planetas antes dos anteroides
        if (setor.planetario == true) {
            //A posição do sol do setor
            let posSol = Math.ceil(setor.tamanho / 2);
            posicoesTomadas.push({ x: posSol, y: posSol });
            //Total de planetas
            let maximo = random.GerarIntAleatorio(Number(process.env.UNIVERSE_SYSTEM_MAX_PLANETS), Number(process.env.UNIVERSE_SYSTEM_MIN_PLANETS));
            if (maximo > (setor.tamanho * setor.tamanho) - 1) {
                maximo = (setor.tamanho * setor.tamanho) - 1;
            }
            for (let i = 0; i < maximo; i++) {
                let posX;
                let posY;
                do {
                    posX = random.GerarIntAleatorio(setor.tamanho, 0);
                    posY = random.GerarIntAleatorio(setor.tamanho, 0);
                } while (isPosicaoTomada(posX, posY));
                posicoesTomadas.push({ x: posX, y: posY });
                this.CriarPlaneta(setor, posX, posY);
            }
        }
        //total de asteroides que serão criados
        var quantidadeAsteroids = random.GerarIntAleatorio(Number(process.env.UNIVERSE_ASTEROIDS_MAX), Number(process.env.UNIVERSE_ASTEROIDS_MIN));
        quantidadeAsteroids = (quantidadeAsteroids > posicoesTomadas.length) ? quantidadeAsteroids : posicoesTomadas.length;
        for (let i = 0; i < quantidadeAsteroids; i++) {
            let posX;
            let posY;
            do {
                posX = random.GerarIntAleatorio(setor.tamanho, 0);
                posY = random.GerarIntAleatorio(setor.tamanho, 0);
            } while (isPosicaoTomada(posX, posY));
            posicoesTomadas.push({ x: posX, y: posY });
            this.CriarAsteroide(setor, posX, posY);
        }
    }
    /**
     * @description Cria os setores do universo.
     */
    static GerarSetores() {
        for (let posX = 0; posX < Number(process.env.UNIVERSE_SIZE_X); posX++) {
            for (let posY = 0; posY < Number(process.env.UNIVERSE_SIZE_Y); posY++) {
                this.CriarSetor(posX, posY);
            }
        }
    }
    /**
     * 
     * @param {boolean} force true se a sincronização é forçada
     * @param {function} callback
     * @description Sincroniza a base de dados
     * 
     */
    static SyncDatabase(force, callback)
    {
            models.Usuario.sync({force : force}).then(() =>
            {
                models.Alianca.sync({force: force}).then(() =>
                {
                    models.Alianca_Rank.sync({force : force}).then(() =>
                    {
                        models.Usuario_Participa_Alianca.sync({force : force});        
                    })
                    models.Alianca_Aplicacao.sync({force: force});
                    models.Alianca_Convite.sync({force: force});
                })
                models.MensagemPrivada.sync({force : force})
                models.EsqeciSenha.sync({force : force})
                
                models.Admin.sync({force : force}).then(() =>
                {
                    bcrypt.hash(process.env.GAME_DEFAULT_ADMIN_PASSWORD, 10, (err, hash) =>
                    {
                        if(err) throw err
                        models.Admin.count({}).then((contagem) =>
                        {
                            if(contagem == 0)
                            {
                                models.Admin.create({usuario : process.env.GAME_DEFAULT_ADMIN_USERNAME, senha : hash});
                            }
                            models.Setor.sync({force: force}).then(() =>
                            {
                                models.Planeta.sync({force : force}).then(() =>
                                {
                                    models.Asteroide.sync({force : force}).then(() =>
                                    {

                                        models.Construcao.sync({force : force}).then(() =>
                                        {
                                            if(callback)
                                                callback()
                                        });
                                    });    
                                });
                            });
                        }); 
                    });    
                });
            }).catch(function(err)
        {
            console.log(err);
            setTimeout(DBBuilder.SyncDatabase, 3000);
        });
        
    }

    /**
    *  @description Apaga todas as constrains da base de dados
    */
   static ClearForeignKeys()
    {
        const queryInterface = models.Con.getQueryInterface();
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
}

module.exports = DBBuilder;
