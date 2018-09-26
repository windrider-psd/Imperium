let glob = require('glob')

let webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let generic_entry = glob.sync('./view/general/*.js')
let frameworks = glob.sync('./view/style/frameworks/*.css')
require('dotenv')

let otimazacao = {}
if(process.env.mode == "production")
{
	otimazacao.minimizer = [new UglifyJsPlugin({test : /.js/})]
}

let general_entry = []
for (let i = 0; i < frameworks.length; i++)
{
	general_entry.push(frameworks[i])
}

for (let i = 0; i < generic_entry.length; i++)
{
	general_entry.push(generic_entry[i])
}

let pages = glob.sync('./view/pages/*/')
let masterExportst = [];
for (let i = 0; i < pages.length; i++)
{
	let dirname = pages[i].split('/')
	dirname = dirname[dirname.length - 2]

	let entries = glob.sync('./view/pages/' + dirname + '/*.+(css|js|pug)')
	if (entries.length > 0)
	{
		let view = null
		for (let j = 0; j < entries.length; j++)
		{
			let pagename = entries[j].split('/')
			pagename = pagename[pagename.length - 1]
			pagename = pagename.split('.')
			let fext = pagename[pagename.length - 1]

			if (fext.toLowerCase() == 'pug')
			{
				view = entries[j]
				// entries.splice(j, 1)
				break
			}

		}
		if (view != null)
		{
			let orderEntry = []

			for (let j = 0; j < general_entry.length; j++)
			{
				orderEntry.push(general_entry[j])
			}
			for (let j = 0; j < entries.length; j++)
			{
				orderEntry.push(entries[j])
			}

			let masterEntryOBJ = {
				mode: process.env.mode,
				entry: orderEntry,
				output:
				{
					path: __dirname + '/dist',
					filename: dirname + '.js',
					publicPath: './'
				},
				module:
				{
					rules: [
					{
						test: /\.(png|jpg)$/,
						loader: 'file-loader'
					},
					{
						test: /\.(woff|woff2|eot|ttf|svg)$/,
						loader: 'url-loader?limit=100000'
					},
					{
						test: /\.css/,
						use: [
						{
							loader: 'style-loader',
						},
						{
							loader: 'css-loader',
							options:
							{
								importLoaders: 1
							}
						},
						{
							loader: 'postcss-loader'
						}]

					},
					{
						test: /\.js/,
						loader: 'babel-loader',
						query:
						{
							presets: ['es2015']
						}
					},
					{
						test: /\.pug/,
						use: [
						{
							loader: 'html-loader',
						},
						{
							loader: 'pug-html-loader'
						}]
					}]
				},
				optimization: otimazacao,
				plugins: [
					new webpack.optimize.OccurrenceOrderPlugin(),
					new webpack.HotModuleReplacementPlugin(),
					// Use NoErrorsPlugin for webpack 1.x
					new webpack.NoEmitOnErrorsPlugin(),

					new HtmlWebpackPlugin(
					{
						template: view,
						filename: dirname + ".html",
						inject: 'head'
					}),
				]
			}
			masterExportst.push(masterEntryOBJ)
		}


	}
}

let userdata_entry = glob.sync('./view/general/userdata/*.js')

masterExportst.push(
{
	mode: process.env.mode,
	entry: userdata_entry,
	output:
	{
		path: __dirname + '/dist',
		filename: 'bundle.general.userdata.js',
		publicPath: './'
	},
	module:
	{
		rules: [
		{
			test: /\.js/,
			loader: 'babel-loader',
			query:
			{
				presets: ['es2015']
			}
		}, ]
	},
	optimization: otimazacao,
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		// Use NoErrorsPlugin for webpack 1.x
		new webpack.NoEmitOnErrorsPlugin()
	]
})

module.exports = masterExportst