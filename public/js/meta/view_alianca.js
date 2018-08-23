/**
 * @typedef AplicacaoResposta
 * @property {number} aliancaID
 * @property {number} usuarioID
 * @property {string} texto
 * @property {Object} usuario
 * @property {number} usuario.id
 * @property {string} usuario.nick
 */


/**
 * @typedef GetMembrosResposta
 * @property {boolean} online
 * @property {Object|null} rank O rank/cargo do jogador da aliança
 * @property {Object} usuario
 * @property {number} usuario.id
 * @property {number} usuario.rank O rank de pontuação total do jogador
 * @property {string} usuario.nick
 * @property {boolean} usuario.banido
 * @property {boolean} usuario.ferias
 */


var isLider;

$("#form-criar-alianca").on('submit', function(){
    var params = FormToAssocArray($(this));
    var btn = $(this).find("button");
    $.ajax({
        url : 'alianca/criar-alianca',
        method : 'POST',
        data : params,
        beforeSend : function()
        {
            btn.text("Criando...")
        },
        success : function()
        {
            GerarNotificacao("Aliança criada com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Criar")
        }
    })
});

$("#btn-sair-alianca").on('click', function(){
    btn = $(this);
    $.ajax({
        url : 'alianca/sair-alianca',
        method : 'POST',
        beforeSend : function()
        {
            btn.text("Saindo...")
        },
        success : function()
        {
            GerarNotificacao("Saída realizada com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Sair da Aliança")
        }
    })
});

function setViewAdministracao()
{
    $.ajax({
        url : 'alianca/getAdministracao',
        method : 'GET',
        dataType : 'JSON',
        success : function(resposta)
        {
            var ranks = resposta[0]
            if(ranks !== null){
                ranksString = '<div class="table-responsive"><table class="table table-striped" id = "tabela-cargos"><thead><tr><th>nome</th><th>Ver Aplicações</th><th>Aceitar Aplicações</th><th>Expulsar</th><th>enviar mensagens circulares</th><th>ver online</th><th>tratados</th><th>Ver frota</th><th>Ver exército</th><th>ver movimento</th><th>Criar cargos</th><th>Atribuir cargos</th><th>Gerenciar Tabs (Fórum)</th><th>Gerenciar Topicos (fórum)</th><th>Editar Página Interna</th><th>Editar Página Interna</th><th>Excluir Cargo</th></tr></thead><tbody>'
                for(var i = 0; i < ranks.length; i++)
                {
                    ranksString += '<tr data-id = "'+ranks[i].id+'"><td><input type "text" value = "'+ranks[i].nome+'" name = "nome"></td>'
                    delete ranks[i].id;
                    delete ranks[i].aliancaID;
                    delete ranks[i].nome
                    for(var chave in ranks[i])
                    {
                        ranksString += "<td><input name = '"+chave+"' type = 'checkbox'"
                        if(ranks[i][chave] == true)
                            ranksString += "checked"
                        ranksString += "></td>"
                    }
                    ranksString += "<td><button type = 'button' class = 'btn btn-danger btn-excluir-cargo'><i class = 'fa fa-times'></i></button></td>"
                    ranksString +="</tr>"
                }
                ranksString += "</tbody></table><button type = 'button' class = 'btn btn-primary salvar-cargos'>Salvar Alterações</button><button type = 'button' class = 'btn btn-success btn-criar-cargo'>Criar Cargo</button></div>"
                $(".tab-content").html(ranksString)
            }
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
}



$(".tab-content").on('click', '.btn-criar-cargo', function()
{
    var div = $(this).parent().find("tbody")
    
    $.ajax({
        url : 'alianca/criar-cargo',
        method : 'POST',
        success : function(criado)
        {
            var htmlString = '<tr data-id = "'+criado.id+'"><td><input type "text" value = "'+criado.nome+'" name = "nome"></td>'
            delete criado.id;
            delete criado.aliancaID;
            delete criado.nome
            for(var chave in criado)
            {
                htmlString += "<td><input name = '"+chave+"' type = 'checkbox'"
                if(criado[chave] == true)
                    htmlString += "checked"
                htmlString += "></td>"
            }
            htmlString += "<td><button type = 'button' class = 'btn btn-danger btn-excluir-cargo'><i class = 'fa fa-times'></i></button></td>"
            htmlString +="</tr>"
            div.append(htmlString)
            GerarNotificacao("Cargo criado", 'success');
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})

$(".tab-content").on('click', '.btn-excluir-cargo', function()
{
    var linha = $(this).parent().parent()
    $.ajax({
        url : 'alianca/excluir-cargo',
        method : 'POST',
        data : {id : linha.data('id')},
        success : function(criado)
        {
            linha.remove()
            GerarNotificacao("Cargo removido com sucesso", 'success');
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})


$(".tab-content").on('click', '.salvar-cargos', function()
{
    var div = $(this).parent()
    var params = new Array();
    var linhas = div.find("tbody tr");
    linhas.each(function(){
        var ppush = FormToAssocArray($(this))
        ppush.id = $(this).data('id')
        params.push(ppush);
    })
    
    $.ajax({
        url : 'alianca/salvar-cargos',
        method : 'POST',
        data : {dados :  JSON.stringify(params)},
        success : function()
        {
            GerarNotificacao("Cargos salvos com sucesso", 'success');
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})


function setViewGeral()
{
    $.ajax({
        url : 'alianca/getMembros',
        method : 'GET',
        dataType : 'JSON',
        success : function(resposta)
        {
            
            /**
             * @type {Array.<GetMembrosResposta>}
             */
            var resultado = resposta.resultado
            var ranks = resposta.ranks
            var htmlString = ''
            var textoCargo


            if(userdata.alianca.rank == null)
            {
                if(userdata.alianca.lider == userdata.session.id)
                    textoCargo = "Líder"
                else
                    textoCargo = "Sem cargo"
            }
            else
                textoCargo = userdata.alianca.rank.nome

            htmlString += '<div class="table-responsive"><table class="table table-striped" id="tabela-geral-alianca"><tbody> <tr><td>Nome:</td><td class="nome">'+userdata.alianca.nome+'</td></tr><tr><td>TAG:</td><td class="tag">'+userdata.alianca.tag+'</td></tr><tr><td>Membros:</td><td class="membros-contagem">'+userdata.alianca.totalMembros+'</td></tr><tr><td>O seu cargo:</td><td class="cargo">'+textoCargo+'</td></tr></tbody></table></div>'
            htmlString += '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Nick</th><th>Cargo</th><th>Rank</th><th>Banido</th><th>Férias</th><th>Online</th><th>Ações</th></tr></thead><tbody>'

            for(var i = 0; i < resultado.length; i++)
            {
                var stringCargo
                var onlineString
                var acoesString =""
                var feriasString = resultado[i].usuario.ferias === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"
                var banidoString = resultado[i].usuario.banido === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"

                if(typeof(resultado[i].online) === 'undefined')
                    onlineString = "Desconhecido"
                else if(resultado[i].online)
                    onlineString = "<span class = 'text-success'><b>Online</b></span>"
                else
                    onlineString = "<span class = 'text-danger'><b>Offline</b></span>"
                if(userdata.alianca.lider == resultado[i].usuario.id)
                    stringCargo = "Líder"
                else if(ranks != null && (isLider || userdata.alianca.rank.ranks_atribuir) && userdata.session.id != resultado[i].usuario.id)
                {
                    stringCargo = "<select class = 'select-att-cargo' data-membro-id = '"+resultado[i].usuario.id+"'><option value = 'null'>Sem Cargo</option>"
                    for(var j = 0; j < ranks.length; j++)
                    {
                        stringCargo += '<option value = "'+ranks[j].id+'" '
                        if( resultado[i].rank != null && resultado[i].rank.id == ranks[j].id)
                            stringCargo += "selected"
                        stringCargo += ">"+ranks[j].nome+"</option>"
                    }
                    stringCargo += "</select>"
                }
                else
                    stringCargo = (resultado[i].rank == null) ? "Sem Cargo" : resultado[i].rank.nome
                
                if(resultado[i].usuario.id != userdata.session.id)
                    acoesString = "<button data-destinatario = '"+resultado[i].usuario.id+"' data-nome = '"+resultado[i].usuario.nome+"' class = 'btn btn-primary btn-sm btn-enviar-mensagem'><i class = 'fa fa-comment'></i></button>"

                if((isLider || (userdata.alianca.rank != null && userdata.alianca.rank.expulsar)) && resultado[i].usuario.id != userdata.session.id)
                    acoesString += '<button type = "button" data-id = "'+resultado[i].usuario.id+'" data-nome = "'+resultado[i].usuario.nick+'" class = "btn btn-danger btn-sm btn-expulsar-membro"><i class = "fa fa-times"></i></button>'
                
                htmlString += '<tr><td>'+resultado[i].usuario.nick+'</td><td>'+stringCargo+'</td><td>'+resultado[i].usuario.rank+'</td><td>'+banidoString+'</td><td>'+feriasString+'</td><td>'+onlineString+'</td><td>'+acoesString+'</td></tr>'
            }
            htmlString +="</tbody></table></div>"
            $(".tab-content").html(htmlString);


        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
}

$(".tab-content").on('click', ".btn-expulsar-membro", function() {
    var id = $(this).data('id')
    var nome = $(this).data('nome')
    var linha = $(this).parent().parent()
    GerarConfirmacao("Tens certeza que desejas expulsar o membro "+nome+"?", function(){

        $.ajax({
            url : 'alianca/expulsar-membro',
            method : 'POST',
            data : {id : id, nome : nome},
            success : function()
            {
                linha.remove();
                GerarNotificacao("Membro expulso com sucesso", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })

    })

})

$(".tab-content").on('change', '.select-att-cargo', function() {
    var params = {id : $(this).data('membro-id'), cargo : this.value}
    $.ajax({
        url : 'alianca/atribuir-cargo',
        method : 'POST',
        data : params,
        success : function()
        {
            GerarNotificacao("Cargo alterado com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        }
    })
})

$(".tab-content").on('click', ".btn-enviar-mensagem", function() {
    AbrirModalEnviarMensagemPrivada($(this).data('destinatario'), $(this).data('nome'));
});

$(document).ready(function() {
    if(userdata.alianca != null)
    {
        isLider = userdata.session.id == userdata.alianca.lider
        setViewGeral()
    }
})
$("#btn-cancelar-aplicacao").on('click', function(){
    btn = $(this);
    $.ajax({
        url : 'alianca/cancelar-aplicacao',
        method : 'POST',
        beforeSend : function()
        {
            btn.text("Cancelando...")
        },
        success : function()
        {
            GerarNotificacao("Aplicação removida com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Cancelar Aplicação")
        }
    })
})

/**
 * @param {Array.<AplicacaoResposta>} aplicacoes 
 */
function setViewAplicacoes(aplicacoes)
{
    var htmlString = "";

    for(var i = 0; i < aplicacoes.length; i++)
    {
        htmlString += '<div class = "table-responsive"><table class ="table table-striped"><tbody><tr><td>Nome:</td><td>'+aplicacoes[i].usuario.nick+'</td></tr><tr><td colspan="2">'+aplicacoes[i].texto+'</td></tr></table>'
        htmlString += '<button class = "btn btn-success aceitar-btn" data-usuario = "'+aplicacoes[i].usuarioID+'" data-valor = "1">Aceitar</button><button class = "btn btn-danger aceitar-btn" data-usuario = "'+aplicacoes[i].usuarioID+'" data-valor = "0">Rejeitar</button></div><hr>'
    }
    $(".tab-content").html(htmlString);
}

$("#tab-aplicacoes").on('click', function()
{
    $.ajax({
        url : 'alianca/getAplicacoes',
        method : 'GET',
        dataType : "JSON",
        success : function( /**@type {Array.<AplicacaoResposta>} */ resposta)
        {
            setViewAplicacoes(resposta);
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})
$("#tab-geral").on('click', function()
{
    setViewGeral()
})
$("#tab-administracao").on('click', function()
{
    setViewAdministracao()
})


$(".tab-content").on('click','.aceitar-btn', function()
{
    var valor = $(this).data('valor')
    var usuario = $(this).data('usuario')
    var btn = $(this);
    $.ajax({
        url : 'alianca/aceitar-aplicacao',
        method : 'POST',
        data : {usuario : usuario, valor : valor},
        success : function()
        {
            if(valor == '1')
                GerarNotificacao("Aplicação aceita com sucesso", 'success')
            else
                GerarNotificacao("Aplicação recusada com sucesso", 'success')
            btn.parent().remove();
        },
        error : function(err)
        {
            console.log(err);
            GerarNotificacao(err.responseText, 'danger')
        },
    })
})

$(".tab-btn").on('click', function()
{
    $(".tab-btn.active").removeClass("active")
    $(this).addClass("active");
})

