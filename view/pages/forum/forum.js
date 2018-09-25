const $ = require('jquery')
const utils = require('./../../general/userdata/utils')
const observer = require('./../../general/observer')
let pagination = require('pagination')
var isLider
var tamanhoPaginas;
let paginaAtual;

observer.Observar('userdata-ready',  function() {
    if(userdata.alianca != null)
    {
        isLider = userdata.session.id == userdata.alianca.lider
    }
    else 
        isLider = false
    
    $(".imperium-title span").text(userdata.alianca.nome)

    if(isLider)
    {
        setViewAdmin()
    }
    getTopicos(1)
    function getTopicos(pagina)
    {
        $.ajax({
            url :'alianca/get-topicos',
            method : "GET",
            data : {pagina : pagina},
            success : function(resposta)
            {   
                paginaAtual = pagina;
                let topicos = resposta.topicos
                let total = resposta.total
                tamanhoPaginas = resposta.tamanhoPagina
                let htmlString = '<thead><tr><th>Tópico</th><th>Total de mensagens</th><th>Última mensagem de:</th>'
                if(isLider || (userdata.alianca.rank != null && userdata.alianca.rank.gerenciar_forum))
                    htmlString += '<th>Ações:</th>'
                htmlString += "</tr></thead><tbody>"
                
                for(let i = 0; i < topicos.length; i++)
                {
                    htmlString += '<tr><td data-id = "'+topicos[i].id+'" class = "td-topico-nome"><a href = "topico-forum?topicoid='+topicos[i].id+'" class = "link">'+topicos[i].nome+'</td><td>'+topicos[i].totalMensagens+'</td><td>'+(topicos[i].ultimaMensagem != null ? topicos[i].ultimaMensagem.usuario.nick : "Nenhuma mensagem")+'</td>'
                    if(isLider || (userdata.alianca.rank != null && userdata.alianca.rank.gerenciar_forum))
                        htmlString += '<td><button class = "btn btn-primary btn-editar-topico" data-id = "'+topicos[i].id+'" data-nome = "'+topicos[i].nome+'" data-responder = "'+topicos[i].responder+'" data-destaque = "'+topicos[i].destaque+'"><i class = "fa fa-edit" title = "Editar tópico"></i></button><button class = "btn btn-danger btn-excluir-topico" data-id = "'+topicos[i].id+'"><i class = "fa fa-times" title = "Excluir tópico"></i></button></td>'
                    htmlString += '</tr>'
                }
                htmlString += "</tbody>"
                $("#conteudo-forum").html(htmlString)
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
                $("#paginacao-forum").html(boostrapPaginator.render())
               
            },
            error : function (err)
            {
                utils.GerarNotificacao(err.message, "danger")
            }
        })


    }
    $("#paginacao-forum").on('click', '.paginacao-pagina', function(){
        let pagina = $(this).data('pagina')
        getTopicos(pagina)
    })
    $("#paginacao-forum").on('click', '.paginacao-anterior', function(){
        paginaAtual--
        getTopicos(paginaAtual)
    })
    $("#paginacao-forum").on('click', '.paginacao-proximo', function(){
        paginaAtual++
        getTopicos(paginaAtual)
    })
    
    $("#conteudo-forum-admin").on('click', '#btn-adicionar-tópico', function()
    {
        $("#modal-adicionar-topico").modal('show')
    })
    function setViewAdmin()
    {
        let htmlString = '<hr><button class = "btn btn-primary imperium-input" id = "btn-adicionar-tópico">Adicionar Tópico</button>'
        $('#conteudo-forum-admin').html(htmlString)
    }

    $("#conteudo-forum").on('click', '.btn-excluir-topico', function()
    {
        utils.GerarConfirmacao("Tens certeza que desejas excluir este tópico?", () => {
            let id = $(this).data('id')
            $.ajax({
                url :'alianca/excluir-topico',
                method : "POST",
                data : {id : id},
                success : function()
                {
                    utils.GerarNotificacao("Tópico removido com sucesso", 'success')
                    getTopicos(paginaAtual)
                },
                error : function (err)
                {
                    utils.GerarNotificacao(err.responseText, "danger")
                }
            })
        })
    })

    $("#conteudo-forum").on('click', '.btn-editar-topico', function()
    {
        let id = $(this).data('id')
        let nome = $(this).data('nome')
        let responder = $(this).data('responder')
        let destaque = $(this).data('destaque')

        $("#form-editar-topico-id").val(id)
        $("#form-editar-topico-nome").val(nome)
        $("#form-editar-topico-responder").attr('checked', responder)
        $("#form-editar-topico-destaque").attr('checked', destaque)
        $("#modal-editar-topico").modal('show')
    })

    $("#form-editar-topico").on('submit', function(){
        let info = utils.FormToAssocArray($(this))
        $.ajax({
            url :'alianca/editar-topico',
            method : "POST",
            data : info,
            success : function()
            {
                let btn = $('.btn-editar-topico[data-id="'+info.id+'"]')
                btn.data('nome', info.nome)
                btn.data('responder', info.responder)
                btn.data('destaque', info.destaque)
                $(".td-topico-nome[data-id='"+info.id+"'] a").text(info.nome)
                utils.GerarNotificacao("Tópico renomeado com sucesso", 'success')
            },
            error : function (err)
            {
                utils.GerarNotificacao(err.responseText, "danger")
            }
        })
    })

    $("#form-adicionar-topico").on('submit', function(){
        let info = utils.FormToAssocArray($(this))
        $.ajax({
            url :'alianca/inserir-topico',
            method : "POST",
            data : info,
            dataType : "JSON",
            success : function(topicoCriado)
            {
                utils.GerarNotificacao("Tópico criado com sucesso", 'success')
                getTopicos(paginaAtual)
            },
            error : function (err)
            {
                utils.GerarNotificacao(err.responseText, "danger")
            }
        })
    })
})

