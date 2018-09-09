var isLider
var tamanhoPaginas
var atualizar = true
var editor;

$(document).ready(function() {
    if(userdata.alianca != null)
        isLider = userdata.session.id == userdata.alianca.lider
    else 
        isLider = false

    editor = isLider || (userdata.alianca.rank != null && userdata.alianca.rank.gerenciar_forum)
    if(editor)
        $("#conteiner-adicionar-mensagem").css('display', 'initial')
    getMensagens(1)
    function getMensagens (pagina)
    {
        $.ajax({
            url :'alianca/get-mensagens-topico',
            method : "GET",
            data : {pagina : pagina, topico : qs.topicoid},
            success : function(resposta)
            {
                let mensagens = resposta.mensagens
                let total = resposta.total
                let tamanhoPaginas = resposta.tamanhoPagina
                let htmlString = ''
                for(let i = 0; i < mensagens.length; i++)
                {
                    htmlString += '<div class = "topico-forum-mensagem-container" data-id ="'+mensagens[i].id+'"><h4><b>'+mensagens[i].usuario.nick+'</b></h4>'
                    htmlString += '<p>'+mensagens[i].conteudo.replace(/(?:\r\n|\r|\n)/g, '<br />')+'</p>'
                    if(editor || mensagens[i].usuario.id == userdata.session.id)
                    {
                        htmlString += '<button type = "button" class = "btn btn-primary btn-sm btn-editar-mensagem">Editar Mensagem</button>'
                        htmlString += '<button type = "button" class = "btn btn-danger btn-sm btn-excluir-mensagem">Excluir Mensagem</button>'
                    }
                    htmlString += '<hr></div>'
                }
                $("#mensagens-conteudo").html(htmlString)

                if(atualizar == true)
                {
                    $('#paginacao-topico-forum').pagination({
                        dataSource: mensagens,
                        locator: 'items',
                        totalNumber: total,
                        pageSize: tamanhoPaginas,
                        autoHidePrevious: true,
                        autoHideNext: true,
                        pageNumber : pagina,
                        
                        callback: function(data, pagination) {
                            // template method of yourself
                            //var html = template(data);
                       //     console.log(html)
                          //  $('#paginacao-topico-forum').html(html);
                        }
                    })
                    $('#paginacao-topico-forum').addHook('afterPageOnClick', function(evento, pagina)
                    {
                        getMensagens(pagina)
                    })
                    $('#paginacao-topico-forum').addHook('afterPreviousOnClick', function(evento, pagina)
                    {
                        getMensagens(pagina)
                    })
                    $('#paginacao-topico-forum').addHook('afterNextOnClick', function(evento, pagina)
                    {
                        getMensagens(pagina)
                    })
                    $('#paginacao-topico-forum').addHook('afterGoInputOnEnter', function(evento, pagina)
                    {
                        getMensagens(pagina)
                    })
                    $('#paginacao-topico-forum').addHook('afterGoButtonOnClick', function(evento, pagina)
                    {
                        getMensagens(pagina)
                    })
                    atualizar = false;
                }   
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    }

    $("#mensagens-conteudo").on('click', '.btn-excluir-mensagem', function()
    {
        GerarConfirmacao("Tens certeza que desejas apagar esta mensagem?", () => {
            let container = $(this).closest('.topico-forum-mensagem-container')
            let id = container.data('id')
            $.ajax({
                url : 'alianca/excluir-mensagem',
                method : 'POST',
                data : {id : id},
                success : function()
                {
                    container.remove()
                    GerarNotificacao("Mensagem removida com sucesso", "success")
                },
                error : function(err)
                {
                    GerarNotificacao(err.responseText, "danger")
                }
            })
        })
    })
    
    $("#form-inserir-mensagem-forum").on('submit', function()
    {
        let params = FormToAssocArray($(this))
        params['topico'] = qs.topicoid

        $.ajax({
            url :'alianca/inserir-mensagem-topico',
            method : "POST",
            data : params,
            success : function()
            {
                GerarNotificacao("Mensagen postada com sucesso", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    })

    $("#mensagens-conteudo").on('click', '.btn-editar-mensagem', function()
    {
        let container = $(this).closest('.topico-forum-mensagem-container')

        let id = container.data('id')
        let conteudo = container.find('p').html()

        $("#form-editar-mensagem-topico-id").val(id)
        $("#form-editar-mensagem-topico-conteudo").val(conteudo)
        $("#modal-editar-mensagem-topico").modal('show')
    })

    $('#form-editar-mensagem-topico').on('submit', function()
    {
        let params = FormToAssocArray($(this))
        let container = $(".topico-forum-mensagem-container[data-id='"+params['id']+"']")
        $.ajax({
            url :'alianca/editar-mensagem-topico',
            method : "POST",
            data : params,
            success : function()
            {
                container.find('p').text(params['conteudo'])
                GerarNotificacao("Mensagen editada com sucesso", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    })

    
})
