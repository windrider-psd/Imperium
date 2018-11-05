let yars = require('yargs').argv
let path = require('path')
let fs = require('fs')

let diretorio;
if(!yars.name)
{
    console.log("A geração de página precisa ter um --name")
    return
}

if(!yars.specialized)
{
    diretorio = path.resolve('view/pages/generic/pages');
}
else
{
    let especializadoDIR = path.resolve(`view/pages/specialized/${yars.specialized}`);
    if(!fs.existsSync(especializadoDIR))
    {
        fs.mkdirSync(especializadoDIR)
        fs.mkdirSync(`${especializadoDIR}/modules`)
        fs.mkdirSync(`${especializadoDIR}/pages`)
    }
    diretorio = `${especializadoDIR}/pages`;
}

let page = `${diretorio}/${yars.name}`
if(fs.existsSync(page))
{
    console.log("Página já existe")
}
else
{
    fs.mkdirSync(page);
    fs.writeFileSync(`${page}/${yars.name}.css`, "", {encoding : 'utf8'})
    fs.writeFileSync(`${page}/${yars.name}.js`, "", {encoding : 'utf8'})
    fs.writeFileSync(`${page}/${yars.name}.pug`, "", {encoding : 'utf8'})
    console.log("Página criada com sucesso");
}