const path = require('path'); // работа с путями в ОС
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // вычистка каталога сборка
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// ESM -> export
// CMJS -> module.exports

module.exports = {
    output: {
        // path - относительно текущего каталога определяет каталог dist
        // __dirname - magic constant
        // C:\users\01
        // /home/users/01
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle-[hash].js', // [hash] - специальное обозначение, сюда будет подставляться hash
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.js$/, // проверяем подходит файл или нет
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$/,
                // loader'ы работают в обратном порядке
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|webp)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8192, // будет использоваться file-loader
                    },
                // отключите image-webpack-loader, если не собирается
                }, 'image-webpack-loader'],
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        minimize: true,
                    }
                }], // будет подключать модули из html (src)
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlPlugin({
            filename: 'index.html', // выходной файл
            template: './src/index.html', // входной файл
        }),
        new MiniCssExtractPlugin({
            filename: '[name]-[hash].css',
        }),
    ],
    optimization: {
        minimizer: [
            new OptimizeCssPlugin(),
            new TerserPlugin({
                cache: true,
                parallel: true,
            }),
        ],
    }
}