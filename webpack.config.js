let glob = require('glob')

let pages = glob.sync('./pages/specific/*.js')
let pagesObj = {}
for(let i = 0; i < pages.length; i++)
{
    let pagename = pages[i].split('/')
    pagename = pagename[pagename.length - 1]
    paganame = pagename.split('.')[0]
    pagesObj[paganame] = [pages[i]]
}

let plugins = []

let general_entry = glob.sync('./pages/general/*.js')
let userdata_entry = glob.sync('./pages/general/userdata/*.js')

module.exports = 
[
    {
        mode : 'development',
        entry : general_entry,
        output : {
            path : __dirname + '/public/js/dist',
            filename : 'bundle.general.js'
        },
        //plugins : plugins
    },
    {
        mode : 'development',
        entry : pagesObj,
        output : {
            path : __dirname + '/public/js/dist/pages',
            filename : '[name].bundle.js'
        },
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
    

