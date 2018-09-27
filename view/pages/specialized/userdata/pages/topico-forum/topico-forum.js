const $ = require('jquery')
const utils = require('./../../../../generic/modules/utils')
const observer = require('./../../../../generic/modules/observer')
const pagination = require('pagination')

var paginaAtual;
var isLider
var editor;
observer.Observar('userdata-ready', function() {
    let qs = utils.ParseGET(window.location.search.substring(1))
    if(userdata.alianca != null)
        isLider = userdata.session.id == userdata.alianca.lider
    else 
        isLider = false

    editor = isLider || (userdata.alianca != null && userdata.alianca.rank != null && userdata.alianca.rank.gerenciar_forum)
    if(editor)
        $("#conteiner-adicionar-mensagem").css('display', 'block')
    getMensagens(1)
    function getMensagens (pagina)
    {
        $.ajax({
            url :'alianca/get-mensagens-topico',
            method : "GET",
            data : {pagina : pagina, topico : qs.topicoid},
            success : function(resposta)
            {
                let nome = resposta.nome
                $('title').text(nome + " - Imperium")
                $("h1.imperium-title").text(nome)
                let mensagens = resposta.mensagens
                let total = resposta.total
                let tamanhoPaginas = resposta.tamanhoPagina
                let htmlString = ''
                for(let i = 0; i < mensagens.length; i++)
                {
                    htmlString += '<div class = "topico-forum-mensagem-container imperium-gradient-background-medium" data-id ="'+mensagens[i].id+'"><h2><b>'+mensagens[i].usuario.nick+'</b></h2>'
                    htmlString += '<div class = "topico-forum-mensagem-container-conteudo"><p>'+mensagens[i].conteudo.replace(/(?:\r\n|\r|\n)/g, '<br />')+'</p></div>'
                    if(editor || mensagens[i].usuario.id == userdata.session.id)
                    {
                        htmlString += '<div class = "topico-forum-mensagem-container-crud">'
                        htmlString += '<button type = "button" class = "btn btn-primary btn-sm btn-editar-mensagem imperium-input">Editar Mensagem</button>'
                        htmlString += '<button type = "button" class = "btn btn-danger btn-sm btn-excluir-mensagem imperium-input">Excluir Mensagem</button>'
                        htmlString += '</div>'
                    }
                    htmlString += '</div>'
                }
                $("#mensagens-conteudo").html(htmlString)


                let boostrapPaginator = new pagination.TemplatePaginator({
                    prelink:'/', current: pagina, rowsPerPage: tamanhoPaginas,
                    totalResult: total, slashSeparator: true,
                    template: function(result) {
                        var i, len;
                        var html = '<div><ul class="pagination">';
                        if(result.pageCount < 2) {
                            html += '</ul></div>';
                            return html;
                        }
                        if(result.previous) {
                            html += '<li><a href="#" class = "paginacao-anterior">Anterior</a></li>';
                        }
                        if(result.range.length) {
                            for( i = 0, len = result.range.length; i < len; i++) {
                                if(result.range[i] === result.current) {
                                    html += '<li class="active"><a href="#" data-pagina="'+result.range[i]+'" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
                                } else {
                                    html += '<li><a href="#" data-pagina="'+result.range[i]+'" class = "paginacao-pagina">' + result.range[i] + '</a></li>';
                                }
                            }
                        }
                        if(result.next) {
                            html += '<li><a href="#" class="paginacao-proximo">Próximo</a></li>';
                        }
                        html += '</ul></div>';
                        return html;
                    }
                });
                $("#paginacao-topico-forum").html(boostrapPaginator.render())
                paginaAtual = pagina;
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            }
        })
    }
    $("#paginacao-topico-forum").on('click', '.paginacao-pagina', function(){
        let pagina = $(this).data('pagina')
        getMensagens(pagina)
    })
    $("#paginacao-topico-forum").on('click', '.paginacao-anterior', function(){
        paginaAtual--
        getMensagens(paginaAtual)
    })
    $("#paginacao-topico-forum").on('click', '.paginacao-proximo', function(){
        paginaAtual++
        getMensagens(paginaAtual)
    })
    $("#mensagens-conteudo").on('click', '.btn-excluir-mensagem', function()
    {
        utils.GerarConfirmacao("Tens certeza que desejas apagar esta mensagem?", () => {
            let container = $(this).closest('.topico-forum-mensagem-container')
            let id = container.data('id')
            $.ajax({
                url : 'alianca/excluir-mensagem',
                method : 'POST',
                data : {id : id},
                success : function()
                {
                    container.remove()
                    utils.GerarNotificacao("Mensagem removida com sucesso", "success")
                },
                error : function(err)
                {
                    utils.GerarNotificacao(err.responseText, "danger")
                }
            })
        })
    })
    
    $("#form-inserir-mensagem-forum").on('submit', function()
    {
        let params = utils.FormToAssocArray($(this))
        params['topico'] = qs.topicoid

        $.ajax({
            url :'alianca/inserir-mensagem-topico',
            method : "POST",
            data : params,
            success : function()
            {
                utils.GerarNotificacao("Mensagen postada com sucesso", 'success')
                getMensagens(paginaAtual)
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            }
        })
    })

    $("#mensagens-conteudo").on('click', '.btn-editar-mensagem', function()
    {
        let container = $(this).closest('.topico-forum-mensagem-container')

        let id = container.data('id')
        let conteudo = container.find('p').html()
        let conteudoFormated = conteudo.replace(/<br>/g, '\n')
        $("#form-editar-mensagem-topico-id").val(id)
        $("#form-editar-mensagem-topico-conteudo").val(conteudoFormated)
        $("#modal-editar-mensagem-topico").modal('show')
    })

    $('#form-editar-mensagem-topico').on('submit', function()
    {
        let params = utils.FormToAssocArray($(this))
        let container = $(".topico-forum-mensagem-container[data-id='"+params['id']+"']")
        $.ajax({
            url :'alianca/editar-mensagem-topico',
            method : "POST",
            data : params,
            success : function()
            {
                container.find('p').text(params['conteudo'])
                utils.GerarNotificacao("Mensagen editada com sucesso", 'success')
            },
            error : function(err)
            {
                utils.GerarNotificacao(err.responseText, 'danger')
            }
        })
    })

    
})
