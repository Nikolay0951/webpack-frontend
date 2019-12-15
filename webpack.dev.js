const path = require('path'); // работа с путями в ОС
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // вычистка каталога сборка
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
    // аналог live-server, но для webpack'а
    devServer: {
        contentBase: './dist',
        port: 8080,
    },
    mode: 'development',
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
                use: ['file-loader'],
            },
            {
                test: /\.html$/,
                use: ['html-loader'], // будет подключать модули из html (src)
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
}