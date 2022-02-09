/** @type {import('next').NextConfig} */

const path = require('path')

module.exports = {
  reactStrictMode: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        $0: [path.resolve(__dirname, 'src/global.ts'), 'default'],
      })
    )

    config.module.rules.push(
      {
        test: /\.(html|txt)$/,
        use: 'raw-loader',
      }
    )

    return config
  },

  webpackDevMiddleware: (config) => {
    return config
  },
}
