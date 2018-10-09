let largura = 180;
let altura = 170;
let $ = require('jquery')
const utils = require('./../../../../generic/modules/utils')
const observer = require('./../../../../generic/modules/observer')



function getGalaxiaInfo(callback = () => {})
{
    $.ajax({
        url : 'mapa/get-galaxia',
        method : 'GET',
        dataType : 'JSON',
        success : function(resposta)
        {
            callback(resposta);
        }
    })
}


observer.Observar('userdata-ready',  () => {
    let galaxia;
    function gerarCasa(setor)
    {
        let p1 = {
            x: largura,
            y: altura / 2
        }
        let p2 = {
            x: largura / 2 + largura / 4,
            y: altura
        }
        let p3 = {
            x: largura / 4,
            y: altura
        }
        let p4 = {
            x: 0,
            y: altura / 2
        }
        let p5 = {
            x: largura / 4,
            y: 0
        }
        let p6 = {
            x: largura / 2 + largura / 4,
            y: 0
        }
        let pontos = [p1, p2, p3, p4, p5, p6]
        let offsetX = (setor.setor.posX) * (largura / 4 + largura / 2)
        let offsetY = altura * setor.setor.posY 
        if(setor.setor.posX % 2 != 0)
        {
            offsetY += altura / 2
        }
        for (let i = 0; i < pontos.length; i++)
        {
            pontos[i].x += offsetX
            pontos[i].y += offsetY
        }

        let pontoTextoSetor = {
            x : offsetX + largura / 4,
            y : offsetY + largura / 2
        }
        let pontoTextoNick = {
            x : pontoTextoSetor.x,
            y : pontoTextoSetor.y + 15,
        }

        let pontoPlanetario = {
            x : offsetX  + 10 + largura / 4,
            y : offsetY + altura / 4
        }

        let cor_classe;
        
        if(setor.setor.usuarioID == null)
        {
            cor_classe = 'mapa-setor-sem'
        }
        else if(setor.setor.usuarioID == userdata.session.id)
        {
            cor_classe = 'mapa-setor-jogador'
        }
        else if(userdata.alianca != null && setor.setor.aliancaID == userdata.alianca.id)
        {
            cor_classe = 'mapa-setor-alianca'
        }
        else
        {
            cor_classe = 'mapa-setor-outro'
        }
        


        return {
            pontos : pontos,
            cor_classe : cor_classe,
            pontoTextoSetor : pontoTextoSetor,
            pontoPlanetario : pontoPlanetario,
            pontoTextoNick : pontoTextoNick
        }

    }

    function gerarHTMLMapa()
    {
        let htmlString = ""
        for(let i = 0; i < galaxia.setores.length; i++)
        {
            let casa = gerarCasa(galaxia.setores[i])
            let htmlPontos = ''
            for (let j = 0; j < casa.pontos.length; j++)
            {
                htmlPontos += casa.pontos[j].x + ',' + casa.pontos[j].y + ' '
            }
            let htmlPlanetario = ''
            if(galaxia.setores[i].setor.planetario == true)
            {
                let c1 = `<circle cx="${casa.pontoPlanetario.x}" cy="${casa.pontoPlanetario.y}" r="8" stroke="black" stroke-width="2" fill="white" />`
                let c2 = `<circle cx="${casa.pontoPlanetario.x}" cy="${casa.pontoPlanetario.y}" r="16" stroke="black" stroke-width="2" fill="transparent" />`
                let c3 = `<circle cx="${casa.pontoPlanetario.x}" cy="${casa.pontoPlanetario.y - 16}" r="2" stroke="black" stroke-width="2" fill="white" />`

                htmlPlanetario = c1 + c2 + c3
            }
            let nickSetor = galaxia.setores[i].setor.usuario != null ? galaxia.setores[i].setor.usuario.nick : ""
            htmlString += `<polygon class="mapa-setor ${casa.cor_classe}"  points="${htmlPontos}" stroke="black" stroke-width="2" stroke-linecap="butt"></polygon><text x="${casa.pontoTextoSetor.x}" y="${casa.pontoTextoSetor.y}" fill="black">${galaxia.setores[i].setor.nome}</text><text x="${casa.pontoTextoNick.x}" y="${casa.pontoTextoNick.y}" fill="black">${nickSetor}</text>${htmlPlanetario}`
        }

        let mapa = $(".mapa-svg")
        let largura_mapa = largura + ( (galaxia.galaxia_tamanho_x - 1) * (largura / 4 + largura / 2) )
        let altura_mapa = (galaxia.galaxia_tamanho_y + 1) * altura
        mapa.attr('width', largura_mapa ) 
        mapa.attr('height', altura_mapa )
        htmlString += '<p class = "nome-setor">aaaa</p>'
        mapa.html(htmlString)

    }

    getGalaxiaInfo((info) => {
        
        galaxia = info;
        console.log(galaxia)
        gerarHTMLMapa();
    })
   
    
   // $(".mapa-svg").on('mouseover', '.mapa-setor', function(){
   //     $(this).attr('fill', '#000')
   // })
    
    
})

