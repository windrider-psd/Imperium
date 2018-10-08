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

const $ = require('jquery')
const utils = require('./../../../../generic/modules/utils')
const BBCodeParser = require('bbcode-parser')
const observer = require('./../../../../generic/modules/observer')
require('select2')

let parser = new BBCodeParser(BBCodeParser.defaultTags());
var isLider;
observer.Observar('userdata-ready',  function (){
    $("#form-criar-alianca").on('submit', function(){
        let params = utils.FormToAssocArray($(this));
        let btn = $(this).find("button");
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
                location.reload(true);
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
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
                location.reload(true);
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
            complete : function()
            {
                btn.text("Sair da Aliança")
            }
        })
    });
    
    function CriarPaginaEditors()
    {
        let elementos = $('.pagina-editor');
        elementos.each(function(){
            sceditor.create(this, {
                format: 'bbcode',
                style: 'js/sceditor/minified/themes/content/default.min.css',
                emoticonsEnabled : false,
                locale : 'pt-BR'
            }); 
        })
    }
    
    window.onresize = function(event) {
        let elementos = $('.pagina-editor')
        elementos.each(function(){
            let editor = sceditor.instance(this)
            editor.width("100%")
        })
    };
    
    function setViewAdministracao()
    {
        $.ajax({
            url : 'alianca/getAdministracao',
            method : 'GET',
            dataType : 'JSON',
            success : function(resposta)
            {
                let ranks = resposta[0]
                let membros = resposta[1]
                let paginaInternaString = ''
                let paginaExternaString = ''
                let ranksString = ''
                let confString = ''
                if(ranks !== null){
                    ranksString = '<h4>Ranks</h4><div class="table-responsive"><table class="table table-striped table-bordered imperium-table imperium-table-background" id = "tabela-cargos"><thead><tr><th>nome</th><th>Ver Aplicações</th><th>Aceitar Aplicações</th><th>Expulsar</th><th>enviar mensagens circulares</th><th>ver online</th><th>ver frotas</th><th>ver exércitos</th><th>Criar ranks</th><th>Atribuir cargos</th><th>Gerênciar fórum</th><th>Editar Página Interna</th><th>Editar Página Externa</th><th>Convidar jogadores</th><th>Excluir Cargo</th></tr></thead><tbody>'
                    for(let i = 0; i < ranks.length; i++)
                    {
                        ranksString += '<tr data-id = "'+ranks[i].id+'"><td><input type "text" value = "'+ranks[i].nome+'" name = "nome" class = "imperium-input" style = "color:black"></td>'
                        delete ranks[i].id;
                        delete ranks[i].aliancaID;
                        delete ranks[i].nome
                        for(let chave in ranks[i])
                        {
                            ranksString += "<td><input name = '"+chave+"' type = 'checkbox'"
                            if(ranks[i][chave] == true)
                                ranksString += "checked"
                            ranksString += "></td>"
                        }
                        ranksString += "<td><button type = 'button' class = 'btn btn-danger btn-excluir-cargo'><i class = 'fa fa-times'></i></button></td>"
                        ranksString +="</tr>"
                    }
                }
                ranksString += "</tbody></table><button type = 'button' class = 'btn btn-primary salvar-cargos imperium-input'>Salvar Alterações</button><button type = 'button' class = 'btn btn-success btn-criar-cargo imperium-input'>Criar Rank</button></div>"
                if(isLider || (userdata.alianca.rank != null && userdata.alianca.rank.paginaInterna))
                {
                    paginaInternaString = '<h4>Página Interna</h4><textarea class= "pagina-editor" id = "pagina-interna" style = "width:100%; height:230px"></textarea>'
                    + '<button class = "btn btn-success btn-salvar-pagina-interna">Salvar</button>'
                }
                if(isLider || (userdata.alianca.rank != null && userdata.alianca.rank.paginaExterna))
                {
                    paginaExternaString = '<h4>Página Externa</h4><textarea class= "pagina-editor" id = "pagina-externa" style = "width:100%; height:230px"></textarea>'
                    + '<button class = "btn btn-success btn-salvar-pagina-externa">Salvar</button>'
                }
                
                if(isLider)
                {
                    confString += '<h4>Renomear</h4><form onsubmit="return false" id="form-renomear-alianca"> <div class="form-group"> <label for="nome">Nome da aliança:</label> <input class="form-control" type="text" name="nome" placeholder="Digite o nome da aliança" required="required" value = "'+userdata.alianca.nome+'"/> </div><div class="form-group"> <label for="tag">Tag da aliança:</label> <input class="form-control" type="text" name="tag" placeholder="Digite o tag da aliança" value = "'+userdata.alianca.tag+'" required="required"/> </div><div class="row"> <div class="col-md-offset-3 col-md-6 text-center"> <button class="btn btn-primary btn-lg btn-block" type="submit">Renomear</button> </div></div></form>'
                    confString += '<h4>Sucessor</h4><select id = "select-sucessor"><option value = "null">Nenhum sucessor</option>'
                    for(let i = 0; i < membros.length; i++)
                    {
                        if(membros[i].usuario.id != userdata.alianca.lider)
                        {
                            let cargoString = (membros[i].rank != null) ? membros[i].rank.nome : "Sem rank"
                            confString += '<option value = "'+membros[i].usuario.id+'"'
                            if(userdata.alianca.sucessor == membros[i].usuario.id)
                                confString += "selected"
                            confString += '>'+membros[i].usuario.nick+' ('+cargoString+') </option>'
                        }
                        
                    }
                    confString += "</select>"
                    confString += "<h4>Template de aplicação</h4><textarea  class = 'form-control' style = 'resize:vertical' rows = '10' id = 'template_aplicacao'>"+((userdata.alianca.aplicacao_template != null) ?  userdata.alianca.aplicacao_template : "")+"</textarea>"
                    confString += '<button class = "btn btn-success" id = "btn-salvar-template">Salvar template</button>'
                    confString += '<h4>Excluir Aliança</h4><div class="row"> <div class="col-md-offset-3 col-md-6 text-center"><button class = "btn btn-danger btn-lg" id = "btn-excluir-alianca">Excluir aliança</button></div></div>'
                }

                $("#tab-content-alianca").html(ranksString + paginaInternaString + paginaExternaString + confString)


                $("#select-sucessor").select2();
                CriarPaginaEditors();
                if($("#pagina-interna")[0] != null)
                {
                    let instanciaInterna = sceditor.instance($("#pagina-interna")[0])
                    instanciaInterna.val(userdata.alianca.paginaInterna)
                }
                if($("#pagina-externa")[0] != null)
                {
                    let instanciaExterna = sceditor.instance($("#pagina-externa")[0])
                    instanciaExterna.val(userdata.alianca.paginaExterna)
                }
                
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    }
    
    $("#tab-content-alianca").on('click', '#btn-excluir-alianca', function() {
        utils.GerarConfirmacao("Tens certeza que desejas excluir a aliança? ", function(){
            $.ajax({
                url : 'alianca/excluir-alianca',
                method : 'POST',
                success : function()
                {
                    location.reload(true);
                },
                error : function(err)
                {
                    utils.GerarNotificacao(err.responseText, 'danger')
                },
            })
        })
        
    })
    $("#tab-content-alianca").on('submit', "#form-renomear-alianca", function()
    {
        let params = utils.FormToAssocArray($(this))
        $.ajax({
            url : 'alianca/renomear-alianca',
            method : 'POST',
            data : params,
            success : function()
            {
                utils.GerarNotificacao("Alianca renomeada com sucesso", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    $("#tab-content-alianca").on('click', '#btn-salvar-template', function() {
        let template = $("#template_aplicacao").val()
        $.ajax({
            url : 'alianca/set-template-aplicacao',
            method : 'POST',
            data : {template : template},
            success : function()
            {
                utils.GerarNotificacao("Template salvo com sucesso.", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    $("#tab-content-alianca").on('click', '.btn-salvar-pagina-externa', function()
    {
        let instancia = sceditor.instance($("#pagina-externa")[0]);
        let bbcode = instancia.val();
        $.ajax({
            url : 'alianca/set-pagina-externa',
            method : 'POST',
            data : {bbcode : bbcode},
            success : function()
            {
                utils.GerarNotificacao("Página externa salva com sucesso", 'success');
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    $("#tab-content-alianca").on('click', '.btn-salvar-pagina-interna', function()
    {
        let instancia = sceditor.instance($("#pagina-interna")[0]);
        let bbcode = instancia.val();
        $.ajax({
            url : 'alianca/set-pagina-interna',
            method : 'POST',
            data : {bbcode : bbcode},
            success : function()
            {
                utils.GerarNotificacao("Página interna salva com sucesso", 'success');
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    $("#tab-content-alianca").on('click', '.btn-criar-cargo', function()
    {
        let div = $(this).parent().find("tbody")
        
        $.ajax({
            url : 'alianca/criar-cargo',
            method : 'POST',
            success : function(criado)
            {
                let htmlString = '<tr data-id = "'+criado.id+'"><td><input type "text" value = "'+criado.nome+'" name = "nome" class = "imperium-input"></td>'
                delete criado.id
                delete criado.aliancaID
                delete criado.nome
                for(let chave in criado)
                {
                    htmlString += "<td><input name = '"+chave+"' type = 'checkbox'"
                    if(criado[chave] == true)
                        htmlString += "checked"
                    htmlString += "></td>"
                }
                htmlString += "<td><button type = 'button' class = 'btn btn-danger btn-excluir-cargo'><i class = 'fa fa-times'></i></button></td>"
                htmlString +="</tr>"
                div.append(htmlString)
                utils.GerarNotificacao("Cargo criado", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    $("#tab-content-alianca").on('click', '.btn-excluir-cargo', function()
    {
        let linha = $(this).parent().parent()
        $.ajax({
            url : 'alianca/excluir-cargo',
            method : 'POST',
            data : {id : linha.data('id')},
            success : function()
            {
                linha.remove()
                utils.GerarNotificacao("Cargo removido com sucesso", 'success');
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    
    $("#tab-content-alianca").on('click', '.salvar-cargos', function()
    {
        let div = $(this).parent()
        let params = new Array();
        let linhas = div.find("tbody tr");
        linhas.each(function(){
            let ppush = utils.FormToAssocArray($(this))
            ppush.id = $(this).data('id')
            params.push(ppush);
        })
        
        $.ajax({
            url : 'alianca/salvar-cargos',
            method : 'POST',
            data : {dados :  JSON.stringify(params)},
            success : function()
            {
                utils.GerarNotificacao("Cargos salvos com sucesso", 'success');
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
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
                let resultado = resposta.resultado
                let ranks = resposta.ranks
                let htmlString = ''
                let textoCargo
    
    
                if(userdata.alianca.rank == null)
                {
                    if(userdata.alianca.lider == userdata.session.id)
                        textoCargo = "Líder"
                    else
                        textoCargo = "Sem cargo"
                }
                else
                    textoCargo = userdata.alianca.rank.nome
    
                htmlString += '<div class="table-responsive"><table class="table table-striped imperium-table" id="tabela-geral-alianca"><tbody> <tr><td>Nome:</td><td class="nome">'+userdata.alianca.nome+'</td></tr><tr><td>TAG:</td><td class="tag">'+userdata.alianca.tag+'</td></tr><tr><td>Membros:</td><td class="membros-contagem">'+userdata.alianca.totalMembros+'</td></tr><tr><td>O seu cargo:</td><td class="cargo">'+textoCargo+'</td></tr></tbody></table></div>'
                htmlString += '<div class="table-responsive"><table class="table table-striped imperium-table"><thead><tr><th>Nick</th><th>Cargo</th><th>Rank</th><th>Banido</th><th>Férias</th><th>Online</th><th>Ações</th></tr></thead><tbody>'
    
                for(let i = 0; i < resultado.length; i++)
                {
                    let stringCargo
                    let onlineString
                    let acoesString =""
                    let feriasString = resultado[i].usuario.ferias === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"
                    let banidoString = resultado[i].usuario.banido === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"
    
                    if(typeof(resultado[i].online) === 'undefined')
                        onlineString = "Desconhecido"
                    else if(resultado[i].online || resultado[i].usuario.id == userdata.session.id)
                        onlineString = "<span class = 'text-success'>Online</span>"
                    else
                        onlineString = "<span class = 'text-danger'><b>Offline</b></span>"
                    if(userdata.alianca.lider == resultado[i].usuario.id)
                        stringCargo = "Líder"
                    else if(ranks != null && (isLider || userdata.alianca.rank.ranks_atribuir) && userdata.session.id != resultado[i].usuario.id)
                    {
                        stringCargo = "<select class = 'select-att-cargo' data-membro-id = '"+resultado[i].usuario.id+"'><option value = 'null'>Sem Cargo</option>"
                        for(let j = 0; j < ranks.length; j++)
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
    
                    if((isLider || (userdata.alianca.rank != null && userdata.alianca.rank.expulsar)) && resultado[i].usuario.id != userdata.session.id && resultado[i].usuario.id != userdata.alianca.lider)
                        acoesString += '<button type = "button" data-id = "'+resultado[i].usuario.id+'" data-nome = "'+resultado[i].usuario.nick+'" class = "btn btn-danger btn-sm btn-expulsar-membro"><i class = "fa fa-times"></i></button>'
                    
                    htmlString += '<tr><td>'+resultado[i].usuario.nick+'</td><td>'+stringCargo+'</td><td>'+resultado[i].usuario.rank+'</td><td>'+banidoString+'</td><td>'+feriasString+'</td><td>'+onlineString+'</td><td>'+acoesString+'</td></tr>'
                }
                htmlString +="</tbody></table></div>"
                let htmlInterna = '';
                if(userdata.alianca.paginaInterna != null)
                {
                    htmlInterna = parser.parseString(userdata.alianca.paginaInterna);
                }
                
                htmlString += "<h4>Página Interna</h4><div>"+htmlInterna
                htmlString += '<div class="row"><div class="col-md-offset-4 col-md-4 text-center"> <button class="btn btn-warning btn-lg btn-block" id="btn-sair-alianca">Sair da Aliança</button></div></div></div>'
                $("#tab-content-alianca").html(htmlString);
    
    
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            }
        })
    }
    
    $("#tab-content-alianca").on('click', ".btn-expulsar-membro", function() {
        let id = $(this).data('id')
        let nome = $(this).data('nome')
        let linha = $(this).parent().parent()
        utils.GerarConfirmacao("Tens certeza que desejas expulsar o membro "+nome+"?", function(){
            $.ajax({
                url : 'alianca/expulsar-membro',
                method : 'POST',
                data : {id : id},
                success : function()
                {
                    linha.remove()
                    utils.GerarNotificacao("Membro expulso com sucesso", 'success')
                },
                error : function(err)
                {
                    utils.GerarNotificacao(err.responseText, 'danger')
                }
            })
        })
    })
    

    $("#tab-content-alianca").on('change', '#select-sucessor', function() {
        let id = $(this).find("option:selected").val()
        $.ajax({
            url : 'alianca/set-sucessor',
            method : 'POST',
            data : {sucessor : id},
            success : function()
            {
                utils.GerarNotificacao("Sucessor alterado com sucesso", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            }
        })
    })

    $("#tab-content-alianca").on('change', '.select-att-cargo', function() {
        let params = {id : $(this).data('membro-id'), cargo : this.value}
        $.ajax({
            url : 'alianca/atribuir-cargo',
            method : 'POST',
            data : params,
            success : function()
            {
                utils.GerarNotificacao("Cargo alterado com sucesso", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            }
        })
    })
    
    $("#tab-content-alianca").on('click', ".btn-enviar-mensagem", function() {
        AbrirModalEnviarMensagemPrivada($(this).data('destinatario'), $(this).data('nome'));
    });
    
    if(userdata.alianca != null)
    {
        isLider = userdata.session.id == userdata.alianca.lider
        $("#com-alianca").removeClass('hidden')
        setViewGeral()
    }
    else
    {
        $("#criar-alianca").removeClass("hidden")
        $.ajax({
            url : 'alianca/get-aplicacao-alianca',
            method : 'GET',
            accepts : "JSON",
            success : function(aplicacao)
            {
                if(aplicacao != null)
                {
                    $.ajax({
                        url : 'alianca/get-aliancadata',
                        method : 'GET',
                        data : {id : aplicacao.aliancaID},
                        accepts : "JSON",
                        success : function(alianca)
                        {
                            
                            $("#aplicacao-alianca span").text(alianca.nome)
                            $("#aplicacao-alianca").removeClass('hidden')
                        }
                    })
                }
            }
        })
    }
    $("#btn-cancelar-aplicacao").on('click', function(){
        let btn = $(this);
        $.ajax({
            url : 'alianca/cancelar-aplicacao',
            method : 'POST',
            beforeSend : function()
            {
                btn.text("Cancelando...")
            },
            success : function()
            {
                utils.GerarNotificacao("Aplicação removida com sucesso", 'success')
                location.reload(true)
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
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
        let htmlString = "";
    
        for(let i = 0; i < aplicacoes.length; i++)
        {
            htmlString += '<div class = "table-responsive"><table class ="table table-striped imperium-table"><tbody><tr><td>Nome:</td><td>'+aplicacoes[i].usuario.nick+'</td></tr><tr><td colspan="2">'+aplicacoes[i].texto+'</td></tr></table>'
            if(userdata.alianca.lider == userdata.session.id || userdata.alianca.rank.aceitar_aplicacoes)
                htmlString += '<button class = "btn btn-success aceitar-btn" data-usuario = "'+aplicacoes[i].usuarioID+'" data-valor = "1">Aceitar</button><button class = "btn btn-danger aceitar-btn" data-usuario = "'+aplicacoes[i].usuarioID+'" data-valor = "0">Rejeitar</button></div><hr>'
        }
        $("#tab-content-alianca").html(htmlString);
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
                utils.GerarNotificacao(err.responseText, 'danger')
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
    $("#tab-mensagem-circular").on('click', function()
    {
        setViewCircular()
    })

    function setViewCircular()
    {
        let htmlString = "<h4>Enviar Mensagem Circular</h4>"
        htmlString += '<form id = "form-circular" onsubmit = "return false">'
        htmlString += '<textarea class="form-control" name="conteudo" placeholder="Digite sua mensagem..." rows="5" style="resize:vertical;"></textarea><br/>'
        htmlString += '<button class="btn btn-primary" type="submit">Enviar mensagem</button></form>'
        $("#tab-content-alianca").html(htmlString)
    }

    $("#tab-content-alianca").on('submit', "#form-circular", function()
    {
        let params = utils.FormToAssocArray($(this))
        $.ajax({
            url : 'alianca/enviar-mensagem-circular',
            method : 'POST',
            data : params,
            success : function()
            {
                utils.GerarNotificacao("Mensagem enviada com sucesso", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    
    $("#tab-content-alianca").on('click','.aceitar-btn', function()
    {
        let valor = $(this).data('valor')
        let usuario = $(this).data('usuario')
        let btn = $(this);
        $.ajax({
            url : 'alianca/aceitar-aplicacao',
            method : 'POST',
            data : {usuario : usuario, valor : valor},
            success : function()
            {
                if(valor == '1')
                    utils.GerarNotificacao("Aplicação aceita com sucesso", 'success')
                else
                    utils.GerarNotificacao("Aplicação recusada com sucesso", 'success')
                btn.parent().remove();
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    $(".tab-btn").on('click', function()
    {
        $(".tab-btn.active").removeClass("active")
        $(this).addClass("active");
    })
    
    
})
