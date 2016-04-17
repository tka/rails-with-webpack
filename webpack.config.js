var path = require('path')
var webpack = require("webpack");

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var ManifestPlugin = require('webpack-manifest-plugin');

var contextPath = __dirname + '/app/assets/javascripts';

var YAML = require('yamljs');
var yamlData = YAML.load('./config/application.yml');
var railsSetting      = yamlData["production"] || yamlData["default"]
var webpackAssetsHost = (railsSetting["webpack_assets_host"])

module.exports = {
    context: contextPath,
    entry: {
        app: './app.js',

        //用來確保所有的圖片跟 vendors js 都會被打上 digest
        static_resource: './static_resources.js',
    },
    output: {
        filename: '[name].[hash].js',
        path: __dirname + '/public/webpack',
        publicPath: "/webpack/"
    },
    module: {
        loaders: [
        { test: /vendors/,   exclude: /node_modules/, loader: 'file-loader?name=[path][name].[hash].[ext]'},
        { test: /\.coffee$/, loader: "coffee-loader" },
        { test: /\.jsx?$/, exclude: /(node_modules|vendors)/, loader: 'babel-loader?presets[]=react&presets[]=es2015' },
        { test: /\.css$/,  loader: ExtractTextPlugin.extract("style-loader", "css-loader", "postcss-loader") },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "url-loader?limit=10000&minetype=application/font-woff&name=[name].[hash].[ext]",
        },
        { test: /\.(otf|ttf|eot|svg|ico|gif|png|jpg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: "file-loader?name=[name].[hash].[ext]",
        },
        {   test: /\.s[ca]ss$/,   loader: ExtractTextPlugin.extract(
                // activate source maps via loader query
                'css?sourceMap!'+
                'postcss-loader!'+
                'sass?includePaths[]=' + path.resolve(__dirname, "./node_modules/compass-mixins/lib")+"!"+
                'import-glob'
                )
        }
        ],
        noParse: [
            /[\/\\]vendors[\/\\].*\.js$/
        ]
    },
    postcss: function(){
        return[
            require('autoprefixer'),
        ]
    },

    resolve: {
        extensions: ['', '.js', '.jsx'],
        modulesDirectories: ["node_modules", "javascripts"],
    },
    externals: {
    },
    devtool: "sourcemap",
    plugins: [
        new ExtractTextPlugin("[name].[hash].css", {
            disable: false,
            allChunks: true
        }),

        // 生成 manifest.json, imageExtensions 這邊用來處理 static resource
        new ManifestPlugin({
            imageExtensions: /^(css|jpe?g|png|gif|svg|woff|woff2|otf|ttf|eot|svg|js|ico|gif)(\.|$)/i
        }),
         new webpack.DefinePlugin({
             _WEBPACK_ASSETS_HOST_:  JSON.stringify(webpackAssetsHost)
         })

    ]
};
