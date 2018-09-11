/**
 * @typedef MensagemObject
 * @property {string} assunto
 * @property {Date} criacao
 * @property {number} destinatario
 * @property {number} remetente
 * @property {string} nick O nick do remetente se inbox. O nick do destinatario se outbox
 * @property {string} mensagem
 * @property {boolean} [visualizada] Se a mensagem foi visualizada. Undefined se outbox
 * @property {number} id
 */

const periodoPaginas = 10;
var inboxbool;
var total;
/**
 * @type {Array.<MensagemObject>}
 */
var boxAux;
const $ = require('jquery')
const utils = require('./../general/userdata/utils')
let resultadosPorPagina = 15;
$(document).ready(function() {
getInbox(1, function(inbox){
    setInboxContent(inbox.mensagens, inbox.total)
});


$("#tab-btn-out").on('click', function()
{
    getOutbox(1, function(outbox){
        setOutboxContent(outbox.mensagens, outbox.total)
    });
})

$("#tab-btn-in").on('click', function()
{
    getInbox(1, function(inbox){
        setInboxContent(inbox.mensagens, inbox.total)
    });
})

/**
 * 
 * @param {number} pagina O número da pagina que será buscada
 * @param {Function} callback callback(inbox : MensagemObject) 
 */
function getInbox(pagina, callback)
{
    $.ajax({
        url : 'comunicacao/getInbox',
        method : "GET",
        data : {pagina : pagina},
        success : function(/** @type {{mensagens : Array.<MensagemObject>, total : number}} */ inbox)
        {
            total = inbox.total
            inboxbool = true;
            boxAux = inbox.mensagens
            if(typeof(callback) === 'function')
                callback(inbox)
        },
        error : function (err)
        {
            GerarNotificao(err.responseText, 'danger');
        }
    })
}

function getOutbox(pagina, callback)
{
    $.ajax({
        url : 'comunicacao/getOutbox',
        method : "GET",
        data : {pagina : pagina},
        success : function(/** @type {{mensagens : Array.<MensagemObject>, total : number}} */ outbox)
        {
            total = outbox.total
            inboxbool = false;
            boxAux = outbox.mensagens
            if(typeof(callback) === 'function')
                callback(outbox)
        },
        error : function (err)
        {
            GerarNotificao(err.responseText, 'danger');
        }
    })
}

/**
 * 
 * @param {Array.<MensagemObject>} inbox 
 * @description Gera a html da lista de mensagens de inbox
 * @returns {string}
 */
function getConteudoTabela(inbox)
{
    var htmlString = '';
    for(var i = 0; i < inbox.length; i++)
    {
        htmlString += "<tr>";
        if(inbox[i].visualizada === false)
            htmlString += "<td><a class = 'link c-pointer mensagem-link' data-id = '"+inbox[i].id+"' data-userid = '"+inbox[i].remetente+"' data-nome = '"+inbox[i].nick+"' data-visualizada = '0'><b>"+inbox[i].assunto+"</b></a></td>"
        else
            htmlString += "<td><a class = 'link c-pointer mensagem-link' data-id = '"+inbox[i].id+"' data-userid = '"+inbox[i].remetente+"' data-nome = '"+inbox[i].nick+"' data-visualizada = '1'>"+inbox[i].assunto+"</a></td>"
        
        htmlString += '<td>'+inbox[i].nick+'</td><td><button type = "button" data-id = "'+inbox[i].id+'" class = "btn btn-danger btn-sm btn-apagar-mensagem"><i class = "fa fa-times"></i></button></td><td>'+FormatarDate(new Date(inbox[i].criacao), '/')+'</td></tr>'
    }
    htmlString += "</tbody></table>"
    return htmlString
}


/**
 * 
 * @param {Array.<MensagemObject>} inbox 
 * @param {number} totalMensagens O total de mensagens do inbox
 */
function setInboxContent(inbox, totalMensagens)
{
    var contentString = '<div class="table-responsive"> <table class="table table-striped table-bordered"> <thead> <tr> <th>Assunto</th> <th>De</th><th>Ações</th><th>Data</th></tr></thead> <tbody id="box-tbody">' 
    contentString += getConteudoTabela(inbox);
    var paginacaoString = "";

    if(totalMensagens > resultadosPorPagina)
    {
        paginacaoString = '<ul class="pagination"><li><a rel="next" id = "paginacao-anterior" onclick="AvancarPagina(-1)" style = "cursor:pointer">Anterior</a></li>'
        var totalPaginas = Math.ceil(totalMensagens / resultadosPorPagina)
        for(var i = 0; i < totalPaginas; i++)
        {
            paginacaoString += '<li class = "paginacao_pagina c-pointer ';
            if(i == 0)
            {
                paginacaoString += 'active';
            }
            paginacaoString += '" data-idpagina="'+i+'"><a href="#">'+(i + 1)+'</a></li>'; 
            
        }
        paginacaoString += '<li><a rel="next" id = "paginacao-proximo" onclick="AvancarPagina(1)" style = "cursor:pointer">Próxima</a></li>';
        paginacaoString += '<form style = "display:inline" id = "form-goto" onsubmit="return false" class = "form-inline"><div class="form-group"><input type="number" id = "paginacao_goto" class = "form-control"/></div><button class = "btn btn-primary" type="submit" id="changePage">Ir</button></form>';
    
    }

    $(".tab-content").html(contentString + paginacaoString + "</div>");
    $("#tab-btn-in").addClass('active');
    $("#tab-btn-out").removeClass('active');
    VerificarProximo(0 + 1, totalMensagens)
}



/**
 * 
 * @param {Array.<MensagemObject>} outbox 
 * @param {number} totalMensagens O total de mensagens do inbox
 */
function setOutboxContent(outbox, totalMensagens)
{
    var contentString = '<div class="table-responsive"> <table class="table table-striped table-bordered"> <thead> <tr> <th>Assunto</th> <th>Para</th><th>Ações</th><th>Data</th></tr></thead><tbody id="box-tbody">' 
    contentString += getConteudoTabela(outbox);
    var paginacaoString = "";

    if(totalMensagens > resultadosPorPagina)
    {
        paginacaoString = '<ul class="pagination"><li><a rel="next" id = "paginacao-anterior" onclick="AvancarPagina(-1)" style = "cursor:pointer">Anterior</a></li>'
        var totalPaginas = Math.ceil(totalMensagens / resultadosPorPagina)
        for(var i = 0; i < totalPaginas; i++)
        {
            paginacaoString += '<li class = "paginacao_pagina c-pointer ';
            if(i == 0)
            {
                paginacaoString += 'active';
            }
            paginacaoString += '" data-idpagina="'+i+'"><a href="#">'+(i + 1)+'</a></li>'; 
            
        }
        paginacaoString += '<li><a rel="next" id = "paginacao-proximo" onclick="AvancarPagina(1)" style = "cursor:pointer">Próxima</a></li>';
        paginacaoString += '<form style = "display:inline" id = "form-goto" onsubmit="return false" class = "form-inline"><div class="form-group"><input type="number" id = "paginacao_goto" class = "form-control"/></div><button class = "btn btn-primary" type="submit" id="changePage">Ir</button></form>';
    
    }

    $(".tab-content").html(contentString + paginacaoString + "</div>");
    $("#tab-btn-out").addClass('active');
    $("#tab-btn-in").removeClass('active');
    VerificarProximo(0 + 1, totalMensagens)
}


function VerificarProximo(paginaAtual, totaldePaginas)
{
    if(paginaAtual >= totaldePaginas)
    {
        $("#paginacao-proximo").addClass("hidden");
    }
    else
    {
        $("#paginacao-proximo").removeClass("hidden");
    }

    if(paginaAtual <= 1)
    {
        $("#paginacao-anterior").addClass("hidden");
    }
    else
    {
        $("#paginacao-anterior").removeClass("hidden");
    }
    EsconderPaginacao(paginaAtual, Math.ceil(totaldePaginas / resultadosPorPagina));
}

/**
 * 
 * @param {number} paginaAtual 
 * @param {number} totaldePaginas 
 * @description Insere os ... entre paginas
 */
function EsconderPaginacao(paginaAtual, totaldePaginas)
{
    $(".paginacao_dots").remove();
    $(".paginacao_pagina").removeClass("hidden");
    var j = paginaAtual + periodoPaginas;
    if(j < totaldePaginas + 1)
    {
        $('<li class="disabled paginacao_dots"><a>...</a></li>').insertBefore($(".paginacao_pagina").eq(j));
       
    }
    for(;j < totaldePaginas; j++)
    {
        $(".paginacao_pagina").eq(j - 1).addClass("hidden");
    }

    var j = paginaAtual - periodoPaginas - 1;
    if(j > 0 )
    {
        $('<li class="disabled paginacao_dots"><a>...</a></li>').insertBefore($(".paginacao_pagina").eq(j));
    }
    for(;j > 0; j--)
    {
        $(".paginacao_pagina").eq(j).addClass("hidden");
    }
}

$(".tab-content").on('click', ".paginacao_pagina", function()
{
    var btnAtual = $(".paginacao_pagina.active");
    var proximaPagina = $(this).data('idpagina');
    if(proximaPagina < 0)
        return;
    else if(proximaPagina + 1 > total)
        return;

    $(this).addClass("active");
    btnAtual.removeClass('active');

    //CarregarTipo(proximaPagina + 1,tipoAtual, false);
    if(inboxbool === true)
    {
        getInbox(proximaPagina + 1, function(inbox){
            $("#box-tbody").html(getConteudoTabela(inbox.mensagens))
        });
    }
        
    else
    {
        getOutbox(proximaPagina + 1, function(outbox){
            $("#box-tbody").html(getConteudoTabela(outbox.mensagens))
        });
    }
    
    VerificarProximo(proximaPagina + 1, Math.ceil(total / resultadosPorPagina))
});

function AvancarPagina(proxima)
{
    var btnAtual = $(".paginacao_pagina.active");
    var paginaAtual = btnAtual.data('idpagina');
    var proximaPagina = paginaAtual += proxima;
    if(proximaPagina < 0)
        return;
    else if(proximaPagina + 1 > total)
        return;

    $(".paginacao_pagina[data-idpagina='"+proximaPagina+"']").addClass("active");
    btnAtual.removeClass('active');

    if(inboxbool === true)
    {
        getInbox(proximaPagina + 1, function(inbox){
            $("#box-tbody").html(getConteudoTabela(inbox.mensagens))
        });
    }
    else
    {
        getOutbox(proximaPagina + 1, function(outbox){
            $("#box-tbody").html(getConteudoTabela(outbox.mensagens))
        });
    }

    VerificarProximo(proximaPagina + 1, Math.ceil(total / resultadosPorPagina))
}

$(".tab-content").on('submit', '#form-goto', function()
{
    let pagina = Number($("#paginacao_goto").val()).toFixed(0);
    var btnAtual = $(".paginacao_pagina.active");
    var paginaAtual = btnAtual.data('idpagina');
    if(inboxbool === true)
    {
        getInbox(pagina, function(){
            AvancarPagina(pagina - paginaAtual - 1)
        });
    }
    else
    {
        getOutbox(pagina + 1, function()
        {
            AvancarPagina(pagina - paginaAtual - 1)
        });
    }
});


/**
 * @param {number} idmensagem O id da mensagem
 * @description Coloca uma mensagem como estado visualizada
 */
function setMensagemVisualizada(idmensagem)
{
    $.ajax({
        url : 'comunicacao/setInboxVisualizada',
        method : 'POST',
        data : {id : idmensagem}
    })
}

$(".tab-content").on('click', '.mensagem-link', function()
{
    if(inboxbool == true)
    {
        if($(this).data('visualizada') == '0')
        {
            setMensagemVisualizada($(this).data('id'))
            var texto = $(this).text()
            $(this).find("b").remove()
            $(this).text(texto)
            $(this).data('visualizada', '1')
        }
    }

    var JModal = $("#modal-visualizar-mensagem-privada");
    var mensagem;
    for(var i = 0; i < boxAux.length; i++)
    {
        if(boxAux[i].id == Number($(this).data('id')))
        {
            mensagem = boxAux[i];
            break
        }
    }
    JModal.find(".modal-title").text(mensagem.assunto);
    JModal.find(".nome").text(mensagem.nick);
    JModal.find(".conteudo").html(mensagem.mensagem.replace(/(?:\r\n|\r|\n)/g, '<br />'));
    JModal.find(".destinatario").val((inboxbool) ? mensagem.remetente : mensagem.destinatario);
    JModal.find(".assunto").val(mensagem.assunto);
    JModal.modal("show");
})

$("#modal-visualizar-mensagem-privada form").on("submit", function(){
    var params = utils.FormToAssocArray($(this));
    var btn = $(this).find("button");
    $.ajax({
        url : 'comunicacao/enviar-mensagem-privada',
        method : 'POST',
        data : params,
        beforeSend : function()
        {
            btn.text("Respondendo...")
        },
        success : function()
        {
            utils.GerarNotificacao("Resposta enviada com sucesso", 'success')
        },
        error : function(err)
        {
            utils.GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Responder Mensagem")
        }
    })
})

$(".tab-content").on('click', '.btn-apagar-mensagem', function()
{
    var id = $(this).data('id');
    var linha = $(this).parent().parent();
    console.log(id);
    var excluir = function () {$.ajax({
        url : 'comunicacao/apagar-mensagem-privada',
        method : 'POST',
        data : {idmensagem : id},
        success : function()
        {
            utils.GerarNotificacao("Mensagem excluida com sucesso", 'success')
            linha.remove();
        },
        error : function(err)
        {
            utils.GerarNotificacao(err.responseText, 'danger')
        }
    })}

    utils.GerarConfirmacao("Tens certeza que desejas excluir esta mensagem?", excluir);
})
})