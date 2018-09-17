let glob = require('glob')
let path = require('path')

let pagesDir = glob.sync('./pages/specific/*/')
let pagesEntry = {}
for(let i = 0; i < pagesDir.length; i++)
{
    let dirname = pagesDir[i].split('/')
    dirname = dirname[dirname.length - 2]
    

    let dirJS = glob.sync('./pages/specific/'+dirname+'/*')
    pagesEntry[dirname] = []
    for(let j = 0; j < dirJS.length; j++)
    {
        let pagename = dirJS[j].split('/')
        pagename = pagename[pagename.length - 1]
        paganame = pagename.split('.')[0]
        pagesEntry[dirname].push(dirJS[j])
    }
    
}
let general_entry = glob.sync('./pages/general/*.js')
let frameworks = glob.sync('./pages/style/frameworks/*.css')

for(let i = 0; i < frameworks.length; i++)
{
    general_entry.push(frameworks[i])
}
let userdata_entry = glob.sync('./pages/general/userdata/*.js')

module.exports = 
[
    {
        mode : 'development',
        entry : general_entry,
        output : {
            path : __dirname + '/public/js/dist',
            filename : 'bundle.general.js',
            publicPath: './public/'
        },
        module:{
            rules:[
                { 
                    test: /\.(png|jpg)$/, loader: 'file-loader' 
                },
                {
                    test: /\.(woff|woff2|eot|ttf|svg)$/, 
                    loader: 'url-loader?limit=100000'
                },
                {
                    test: /\.css/,
                    include : [
                        path.resolve(__dirname, 'pages/style/frameworks'),
                    ],
                    use :[
                        {
                            loader : 'style-loader',
                        },
                        {
                            loader : 'css-loader',
                        }
                    ]
                    
                }
            ]
        }
    },
    {
        mode : 'development',
        entry : pagesEntry,
        output : {
            path : __dirname + '/public/js/dist/pages',
            filename : '[name].bundle.js',
            publicPath: './public/'
        },
        module:{
            rules:[
                { 
                    test: /\.(png|jpg)$/, loader: 'file-loader' 
                },
                {
                    test: /\.css/,
                    include : [
                        path.resolve(__dirname, 'pages/specific')
                    ],
                    use :[
                        {
                            loader : 'style-loader',
                        },
                        {
                            loader : 'css-loader',
                        }
                    ]
                    
                },
            ],
        }
    },
    {
        mode : 'development',
        entry : userdata_entry,
        output : {
            path : __dirname + '/public/js/dist',
            filename : 'bundle.general.userdata.js'
        },
    }
]
    

