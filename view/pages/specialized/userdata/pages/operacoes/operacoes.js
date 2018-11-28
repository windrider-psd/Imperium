let $ = require('jquery')
require('bootstrap')
const observer = require('./../../../../generic/modules/observer')
const utils = require('./../../../../generic/modules/utils')
const naveBuilder = require('./../../../../../../prefabs/NaveBuilder')

function getOperacoes(callback = () => {})
{
    $.ajax({
        url : "militar/operacao",
        method : "GET",
        dataType : "JSON",
        success : (operacoes) => {
            console.log(operacoes)
            callback(operacoes)
        },
        error : (err) => {
            utils.GerarNotificacao(err.responseText, "danger");
        }
    })
}

function gerarHtmlOperacoes(operacoes)
{
    let htmlString = ""
    for(let i = 0; i < operacoes.length; i++)
    {
        let recursosString = ``
        for(let chave in operacoes[i].recursos)
        {
            recursosString += `${chave}:${operacoes[i].recursos[chave]}<br>`
        }

        let frotaString = ``
        for(let chave in operacoes[i].frota)
        {
            let nave = naveBuilder.getNavePorNomeTabela(chave)
            frotaString += `${nave.nome}:${operacoes[i].frota[chave]}<br>`
        }
        
        let estagioString

        if(operacoes[i].operacao == "pilhar")
        {
            switch(operacoes[i].estagio)
            {
                case 1:
                    estagioString = "Ida"
                    break
                case 2: 
                    estagioString = "Combate"
                    break
                case 3: 
                    estagioString = "Retornando"
                    break
            }
        }
        else if(operacoes[i].operacao == "colonizar")
        {
            switch(operacoes[i].estagio)
            {
                case 1:
                    estagioString = "Ida"
                    break
                case 2: 
                    estagioString = "Colonizando"
                    break
            }
        }
        else
        {
            estagioString = `Desconhecido (${operacoes[i].estagio})`
        }

        htmlString += 
        `
        <tr>
            <td>${operacoes[i].operacao}</td>
            <td>${frotaString}</td>
            <td>${recursosString}</td>
            <td>${operacoes[i].nomeOrigem}</td>
            <td>${operacoes[i].nomeAtual}</td>
            <td>${operacoes[i].nomeDestino}</td>
            <td>${estagioString}</td>
        </tr>
        `
    }
    return htmlString
}

observer.Observar('userdata-ready',  () => {
    getOperacoes(operacoes => {
        let htmlOperacoes = gerarHtmlOperacoes(operacoes)
        console.log(htmlOperacoes)
        $("#operacoes tbody").html(htmlOperacoes)
    })
})