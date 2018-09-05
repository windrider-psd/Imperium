var isLider
var tamanhoPaginas;
var atualizar = true;
$(document).ready(function() {
    if(userdata.alianca != null)
    {
        isLider = userdata.session.id == userdata.alianca.lider
    }
    else 
        isLider = false

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
                let topicos = resposta.topicos
                let total = resposta.total
                tamanhoPaginas = resposta.tamanhoPagina
                let htmlString = '<thead><tr><th>Tópico</th><th>Total de mensagens</th><th>Última mensagem de:</th>'
                if(isLider || userdata.alianca.rank.gerenciar_forum)
                    htmlString += '<th>Ações:</th>'
                htmlString += "</tr></thead><tbody>"
                
                for(let i = 0; i < topicos.length; i++)
                {
                    htmlString += '<tr><td><a href = "topico-forum?topicoid='+topicos[i].id+'" class = "link">'+topicos[i].nome+'</td><td>'+topicos[i].totalMensagens+'</td><td>'+(topicos[i].ultimaMensagem != null ? topicos[i].ultimaMensagem.nick : "Nenhuma mensagem")+'</td>'
                    if(isLider || userdata.alianca.rank.gerenciar_forum)
                        htmlString += '<td><button class = "btn btn-primary btn-editar-topico" data-id = "'+topicos[i].id+'"><i class = "fa fa-edit" title = "Editar tópico"></i></button><button class = "btn btn-danger btn-excluir-topico" data-id = "'+topicos[i].id+'"><i class = "fa fa-times" title = "Excluir tópico"></i></button></td>'
                    htmlString += '</tr>'
                }
                htmlString += "</tbody>"
                $("#conteudo-forum").html(htmlString)
                if(atualizar == true)
                {
                    $('#paginacao-forum').pagination({
                        dataSource: topicos,
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
                          //  $('#paginacao-forum').html(html);
                        }
                    })
                    $('#paginacao-forum').addHook('afterPageOnClick', function(evento, pagina)
                    {
                        getTopicos(pagina)
                    })
                    $('#paginacao-forum').addHook('afterPreviousOnClick', function(evento, pagina)
                    {
                        getTopicos(pagina)
                    })
                    $('#paginacao-forum').addHook('afterNextOnClick', function(evento, pagina)
                    {
                        getTopicos(pagina)
                    })
                    $('#paginacao-forum').addHook('afterGoInputOnEnter', function(evento, pagina)
                    {
                        getTopicos(pagina)
                    })
                    $('#paginacao-forum').addHook('afterGoButtonOnClick', function(evento, pagina)
                    {
                        getTopicos(pagina)
                    })
                    $("#conteudo-forum-admin").on('click', '#btn-adicionar-tópico', function()
                    {
                        $("#modal-adicionar-topico").modal('show')
                    })
                    atualizar = false;
                }   
               
            },
            error : function (err)
            {
                GerarNotificacao(err.message, "danger")
            }
        })


    }

    function setViewAdmin()
    {
        let htmlString = '<hr><button class = "btn btn-primary" id = "btn-adicionar-tópico">Adicionar Tópico</button>'
        $('#conteudo-forum-admin').html(htmlString)
    }

    $("#conteudo-forum").on('click', '.btn-excluir-topico', function()
    {
        GerarConfirmacao("Tens certeza que desejas excluir este tópico?", () => {
            let id = $(this).data('id')
            let linha = $(this).parent().parent();
            $.ajax({
                url :'alianca/excluir-topico',
                method : "POST",
                data : {id : id},
                success : function()
                {
                    linha.remove()
                    GerarNotificacao("Tópico removido com sucesso", 'success')
                },
                error : function (err)
                {
                    console.log(err)
                    GerarNotificacao(err.responseText, "danger")
                }
            })
        })
        
    })
    $("#form-adicionar-topico").on('submit', function(){
        let info = FormToAssocArray($(this))
        $.ajax({
            url :'alianca/inserir-topico',
            method : "POST",
            data : info,
            dataType : "JSON",
            success : function(topicoCriado)
            {
                GerarNotificacao("Tópico criado com sucesso", 'success')
            },
            error : function (err)
            {
                GerarNotificacao(err.responseText, "danger")
            }
        })
    })
})

