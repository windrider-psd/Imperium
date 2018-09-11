let glob = require('glob')
let pages = glob.sync('./pages/specific/*.js')
let pagesObj = {}
for(let i = 0; i < pages.length; i++)
{
    let pagename = pages[i].split('/')
    pagename = pagename[pagename.length - 1]
    paganame = pagename.split('.')[0]
    pagesObj[paganame] = pages[i]
}

module.exports = 
[
    {
        mode : 'development',
        entry : glob.sync('./pages/general/*.js'),
        output : {
            path : __dirname + '/public/js/dist',
            filename : 'bundle.general.js'
        }
    },
    {
        mode : 'development',
        entry : pagesObj,
        output : {
            path : __dirname + '/public/js/dist/pages',
            filename : '[name].bundle.js'
        }
    },
    {
        mode : 'development',
        entry : glob.sync('./pages/general/userdata/*.js'),
        output : {
            path : __dirname + '/public/js/dist',
            filename : 'bundle.general.userdata.js'
        }
    }
]
    

