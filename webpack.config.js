let glob = require('glob')
let path = require('path')
let pages = glob.sync('./pages/specific/**/*.js')
let pagesObj = {}
for(let i = 0; i < pages.length; i++)
{
    let pagename = pages[i].split('/')
    pagename = pagename[pagename.length - 1]
    paganame = pagename.split('.')[0]
    pagesObj[paganame] = [pages[i]]
}
let general_entry = glob.sync('./pages/general/*.js')
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
        //plugins : plugins
    },
    {
        mode : 'development',
        entry : pagesObj,
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
        //plugins : plugins
    },
    {
        mode : 'development',
        entry : userdata_entry,
        output : {
            path : __dirname + '/public/js/dist',
            filename : 'bundle.general.userdata.js'
        },
       // plugins : plugins
    }
]
    

