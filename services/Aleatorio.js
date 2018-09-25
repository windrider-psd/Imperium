/**
 * @param {number} max O valor máximo do resultado
 * @param {number} min O valor minimo do resultado
 * @description Gerar um numero inteiro aleatório
 * @returns {number}
 */
function GerarIntAleatorio(max, min)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 
 * @param {number} tamanho O tamanho da String aleatória
 * @description Gera uma String aleatório formadade de letras ou numeros
 * @returns {string}
 */
function GerarStringAleatoria(tamanho)
{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < tamanho; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = {
    GerarIntAleatorio : GerarIntAleatorio,
    GerarStringAleatoria : GerarStringAleatoria
}