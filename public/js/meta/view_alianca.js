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
$(document).ready(function (){
    $("#form-criar-alianca").on('submit', function(){
        let params = FormToAssocArray($(this));
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
                console.log(membros)
                let paginaInternaString = ''
                let paginaExternaString = ''
                let ranksString = ''
                let confString = ''
                if(ranks !== null){
                    ranksString = '<h4>Ranks</h4><div class="table-responsive"><table class="table table-striped" id = "tabela-cargos"><thead><tr><th>nome</th><th>Ver Aplicações</th><th>Aceitar Aplicações</th><th>Expulsar</th><th>enviar mensagens circulares</th><th>ver online</th><th>tratados</th><th>Ver frota</th><th>Ver exército</th><th>ver movimento</th><th>Criar ranks</th><th>Atribuir cargos</th><th>Gerenciar Tabs (Fórum)</th><th>Gerenciar Topicos (fórum)</th><th>Editar Página Interna</th><th>Editar Página Interna</th><th>Convidar jogadores</th><th>Excluir Cargo</th></tr></thead><tbody>'
                    for(let i = 0; i < ranks.length; i++)
                    {
                        ranksString += '<tr data-id = "'+ranks[i].id+'"><td><input type "text" value = "'+ranks[i].nome+'" name = "nome"></td>'
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
                ranksString += "</tbody></table><button type = 'button' class = 'btn btn-primary salvar-cargos'>Salvar Alterações</button><button type = 'button' class = 'btn btn-success btn-criar-cargo'>Criar Rank</button></div>"
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
                    confString += '<h4>Sucessor</h4>'
                    confString += '<h4>Excluir Aliança</h4><div class="row"> <div class="col-md-offset-3 col-md-6 text-center"><button class = "btn btn-danger btn-lg" id = "btn-excluir-alianca">Excluir aliança</button></div></div>'
                }

                $("#tab-content-alianca").html(ranksString + paginaInternaString + paginaExternaString + confString)
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
                GerarNotificacao(err.responseText, 'danger')
            },
        })
    }
    
    $("#tab-content-alianca").on('click', '#btn-excluir-alianca', function() {
        GerarConfirmacao("Tens certeza que desejas excluir a aliança? ", function(){
            $.ajax({
                url : 'alianca/excluir-alianca',
                method : 'POST',
                success : function()
                {
                    location.reload(true);
                },
                error : function(err)
                {
                    GerarNotificacao(err.responseText, 'danger')
                },
            })
        })
        
    })
    $("#tab-content-alianca").on('submit', "#form-renomear-alianca", function()
    {
        let params = FormToAssocArray($(this))
        $.ajax({
            url : 'alianca/renomear-alianca',
            method : 'POST',
            data : params,
            success : function()
            {
                GerarNotificacao("Alianca renomeada com sucesso", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
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
                GerarNotificacao("Página externa salva com sucesso", 'success');
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
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
                GerarNotificacao("Página interna salva com sucesso", 'success');
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
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
                let htmlString = '<tr data-id = "'+criado.id+'"><td><input type "text" value = "'+criado.nome+'" name = "nome"></td>'
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
                GerarNotificacao("Cargo criado", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
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
                GerarNotificacao("Cargo removido com sucesso", 'success');
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    
    $("#tab-content-alianca").on('click', '.salvar-cargos', function()
    {
        let div = $(this).parent()
        let params = new Array();
        let linhas = div.find("tbody tr");
        linhas.each(function(){
            let ppush = FormToAssocArray($(this))
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
    
                htmlString += '<div class="table-responsive"><table class="table table-striped" id="tabela-geral-alianca"><tbody> <tr><td>Nome:</td><td class="nome">'+userdata.alianca.nome+'</td></tr><tr><td>TAG:</td><td class="tag">'+userdata.alianca.tag+'</td></tr><tr><td>Membros:</td><td class="membros-contagem">'+userdata.alianca.totalMembros+'</td></tr><tr><td>O seu cargo:</td><td class="cargo">'+textoCargo+'</td></tr></tbody></table></div>'
                htmlString += '<div class="table-responsive"><table class="table table-striped"><thead><tr><th>Nick</th><th>Cargo</th><th>Rank</th><th>Banido</th><th>Férias</th><th>Online</th><th>Ações</th></tr></thead><tbody>'
    
                for(let i = 0; i < resultado.length; i++)
                {
                    let stringCargo
                    let onlineString
                    let acoesString =""
                    let feriasString = resultado[i].usuario.ferias === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"
                    let banidoString = resultado[i].usuario.banido === false ? "<span>Não</span>" : "<span class = 'text-danger'>Sim</span>"
    
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
                    htmlInterna = XBBCODE.process({
                        text: userdata.alianca.paginaInterna,
                        removeMisalignedTags: false,
                        addInLineBreaks: false
                    }).html;
                }
                
                htmlString += "<h4>Página Interna</h4><div>"+htmlInterna+"</div>"
                $("#tab-content-alianca").html(htmlString);
    
    
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    }
    
    $("#tab-content-alianca").on('click', ".btn-expulsar-membro", function() {
        let id = $(this).data('id')
        let nome = $(this).data('nome')
        let linha = $(this).parent().parent()
        GerarConfirmacao("Tens certeza que desejas expulsar o membro "+nome+"?", function(){
            $.ajax({
                url : 'alianca/expulsar-membro',
                method : 'POST',
                data : {id : id},
                success : function()
                {
                    linha.remove()
                    GerarNotificacao("Membro expulso com sucesso", 'success')
                },
                error : function(err)
                {
                    GerarNotificacao(err.responseText, 'danger')
                }
            })
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
                GerarNotificacao("Cargo alterado com sucesso", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    })
    
    $("#tab-content-alianca").on('click', ".btn-enviar-mensagem", function() {
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
        let htmlString = "";
    
        for(let i = 0; i < aplicacoes.length; i++)
        {
            htmlString += '<div class = "table-responsive"><table class ="table table-striped"><tbody><tr><td>Nome:</td><td>'+aplicacoes[i].usuario.nick+'</td></tr><tr><td colspan="2">'+aplicacoes[i].texto+'</td></tr></table>'
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
                    GerarNotificacao("Aplicação aceita com sucesso", 'success')
                else
                    GerarNotificacao("Aplicação recusada com sucesso", 'success')
                btn.parent().remove();
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            },
        })
    })
    
    $(".tab-btn").on('click', function()
    {
        $(".tab-btn.active").removeClass("active")
        $(this).addClass("active");
    })
    
    
})
