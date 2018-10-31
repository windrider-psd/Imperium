/**
 * @typedef {Object} Recursos
 * @property {number} ferro
 * @property {number} cristal
 * @property {number} titanio
 * @property {number} componente
 * @property {number} energia
 * @property {number} capacidade
 */

/**
 * @typedef {Object} CustoEdificio
 * @property {number} ferro
 * @property {number} cristal
 * @property {number} titanio
 * @property {number} componente
 */


class Edificio {
	/**
	 * 
	 * @param {string} nome O nome completo do edíficio
	 * @param {string} nome_tabela O nome do edifício na tabela
     * @param {string} icone O nome do arquivo que representa o edificio
     * @param {boolean} produtor_energia Se é um edificio que produz energia
	 * @param {Function} producao function(nivel : number, consumo : number, energiaTotal : number, isp : number) : Recursos A função que retorna a produção do edificio
	 * @param {Function} melhoria function(nivel : number) : CustoEdificil Retorna os recursos necessários para melhoria
     * @param {Function} consumo function(nivel : number) : number Calcula o consumo de energia
	 */
	constructor(nome, nome_tabela, icone, produtor_energia, producao, melhoria, consumo) {
		this.nome = nome
		this.nome_tabela = nome_tabela
		this.producao = producao
        this.melhoria = melhoria
        this.consumo = consumo
        this.produtor_energia = produtor_energia
        this.icone = icone
        this.nivel = 0
	}

}


let mina_ferro = new Edificio("Mina de Ferro", "mina_ferro", "mina-ferro.jpg", false,
    (nivel, consumo, energiaTotal, isp) => {
        let multiplicador = (energiaTotal - consumo < 0) ? (energiaTotal / consumo) : 1
        let eficiencia = (-0.0029 * isp + 200) / 100

        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: 0,
            componente: 0,
            cristal: 0,
            energia: 0,
            ferro: Math.ceil(15 * nivel * Math.pow(1.1, nivel) * multiplicador * eficiencia + 10),
            titanio: 0
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((172 * Math.pow(1.6, (nivel - 1)))),
            cristal: Math.ceil((65 * Math.pow(1.4, (nivel - 1)))),
            titanio: 0,
            componente: 0
        };

        return retorno
    }, (nivel) => {
        return Math.ceil(20 * nivel * Math.pow(1.1, nivel));
    }
)


let mina_cristal = new Edificio("Mina de Cristal", "mina_cristal", "mina-cristal.jpg", false,
    (nivel, consumo, energiaTotal, isp) => {
        let multiplicador = (energiaTotal - consumo < 0) ? (energiaTotal / consumo) : 1
        let eficiencia = (0.0025 * isp + 30) / 100

        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: 0,
            componente: 0,
            cristal: Math.ceil (60 * nivel * Math.pow(1.1, nivel) * multiplicador * eficiencia + 10),
            energia: 0,
            ferro: 0,
            titanio: 0
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((185 * Math.pow(1.5, (nivel - 1)))),
            cristal: Math.ceil((92 * Math.pow(1.5, (nivel - 1)))),
            titanio: 0,
            componente: 0
        };

        return retorno
    }, (nivel) => {
        return Math.ceil(20 * nivel * Math.pow(1.1, nivel));
    }
)

let mina_titanio = new Edificio("Mina de Titânio", "mina_titanio", "mina-titanio.jpg", false,
    (nivel, consumo, energiaTotal) => {
        let multiplicador = (energiaTotal - consumo < 0) ? (energiaTotal / consumo) : 1

        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: 0,
            componente: 0,
            cristal: 0,
            energia: 0,
            ferro: 0,
            titanio: Math.ceil((3 * nivel * Math.pow(1.1, nivel) * multiplicador) + 1)
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((175 * Math.pow(2.1, (nivel - 1)))),
            cristal:  Math.ceil((190 * Math.pow(1.2, (nivel - 1)))),
            titanio: 0,
            componente: 0
        };

        return retorno
    }, (nivel) => {
        return Math.ceil(40 * nivel * Math.pow(1.1, nivel));
    }
)

let fabrica_componente = new Edificio("Fábrica de Componêntes", "fabrica_componente", "fabrica-componente.jpg", false,
    (nivel, consumo, energiaTotal) => {
        let multiplicador = (energiaTotal - consumo < 0) ? (energiaTotal / consumo) : 1

        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: 0,
            componente: Math.ceil((5 * nivel * Math.pow(1.1, nivel)) * multiplicador  + 5),
            cristal: 0,
            energia: 0,
            ferro: 0,
            titanio: 0
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((112 * Math.pow(1.4, (nivel - 1)))),
            cristal:  Math.ceil((145 * Math.pow(1.3, (nivel - 1)))),
            titanio: Math.ceil((32 * Math.pow(1.1, (nivel - 1)))),
            componente: 0
        };

        return retorno
    }, (nivel) => {
        return Math.ceil(30 * nivel * Math.pow(1.1, nivel));
    }
)

let planta_solar = new Edificio("Planta Solar", "planta_solar", "planta-solar.jpg", true,
    (nivel, consumo, energiaTotal, isp) => {
        
        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: 0,
            componente: 0,
            cristal: 0,
            energia: Math.ceil(((70 * nivel * Math.pow(1.1, nivel)) * (isp / 100)) + 100),
            ferro: 0,
            titanio: 0
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((120 * Math.pow(1.5, (nivel - 1)))),
            cristal:  Math.ceil((170 * Math.pow(1.4, (nivel - 1)))),
            titanio: 0,
            componente: 0
        };

        return retorno
    }, () => {
        return 0;
    }
)

let reator_fusao = new Edificio("Reator de fusão", "reator_fusao", "reator-fusao.jpg", true,
    (nivel) => {
        
        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: 0,
            componente: 0,
            cristal: 0,
            energia: Math.ceil(((200 * nivel * Math.pow(1.1, nivel)))),
            ferro: 0,
            titanio: 0
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((210 * Math.pow(1.3, (nivel - 1)))),
            cristal:  Math.ceil((210 * Math.pow(1.5, (nivel - 1)))),
            titanio: Math.ceil((150 * Math.pow(2, (nivel - 1)))),
            componente: 0
        };

        return retorno
    }, () => {
        return 0;
    }
)

let armazem = new Edificio("Armazém", "armazem", "armazem.jpg", false,
    (nivel) => {
        
        /**
         * @type {Recursos}
         */
        let retorno = {
            capacidade: Math.ceil(nivel * (Math.pow(2500, 1.015)) + 10000),
            componente: 0,
            cristal: 0,
            energia: 0,
            ferro: 0,
            titanio: 0
        }
        return retorno
    }, (nivel) => {
        /**
         * @type {CustoEdificio}
         */
        let retorno = {
            ferro:  Math.ceil((210 * Math.pow(1.3, (nivel - 1)))),
            cristal:  Math.ceil((210 * Math.pow(1.5, (nivel - 1)))),
            titanio: Math.ceil((150 * Math.pow(2, (nivel - 1)))),
            componente: 0
        };

        return retorno
    }, () => {
        return 0;
    }
)


/**
 * @type {Object.<Edificio>}
 */
let exports_obj = {
    mina_ferro : mina_ferro,
    mina_cristal : mina_cristal,
    mina_titanio : mina_titanio,
    fabrica_componente : fabrica_componente,
    planta_solar : planta_solar,
    reator_fusao : reator_fusao,
    armazem : armazem
}

module.exports = exports_obj
