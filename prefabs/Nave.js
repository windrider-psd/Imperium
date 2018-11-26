/**
 * @typedef {Object} Custo
 * @property {number} ferro
 * @property {number} cristal
 * @property {number} titanio
 * @property {number} componente
 */


class Nave {
    /**
     * 
     * @param {string} nome O nome da nave 
     * @param {string} nome_tabela O nome na tabela no banco de dados
     * @param {number} quantidade_armas A quantidade de armas da nave
     * @param {number} dano O dano da nave
     * @param {number} hp Maior que 0
     * @param {number} armadura 
     * @param {number} escudo Maior que 0
     * @param {number} evasao entre 0 a 100
     * @param {number} velocidade Maior que 0
     * @param {number} capacidade_transporte Maior que 0
     * @param {Custo} custo
     */
    constructor(nome, nome_tabela, quantidade_armas, dano, hp, armadura, escudo, evasao, velocidade, capacidade_transporte, custo)
    {
        this.nome = nome
        this.nome_tabela = nome_tabela
        this.quantidade_armas = quantidade_armas
        this.dano = dano
        this.hp = hp
        this.armadura = armadura
        this.escudo = escudo
        this.evasao = evasao
        this.velocidade = velocidade
        this.capacidade_transporte = capacidade_transporte,
        this.custo = custo;
    }
}

let caca = new Nave("Caça", "caca", 1, 20, 100, 2, 50, 70, 8, 100, {ferro : 1, cristal: 1, componente: 1, titanio: 0})
let cargueiro = new Nave("Cargueiro", "cargueiro", 1, 20, 100, 2, 50, 70, 8, 100, {ferro : 15000, cristal: 2000, componente: 1500, titanio: 0})
let sonda_espionagem = new Nave("Sonda de espionagem", "sonda", 1, 20, 100, 2, 50, 70, 8, 100, {ferro : 4000, cristal: 4000, componente: 1000, titanio: 1000})



/**
 * @type {Object.<string, Nave>}
 */
let mexports = {
    caca : caca,
    cargueiro : cargueiro,
    sonda_espionagem : sonda_espionagem
}

module.exports = mexports

