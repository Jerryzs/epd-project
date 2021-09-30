/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new webpack.ProvidePlugin({
        $0: [path.resolve(__dirname, 'src/global.ts'), 'default'],
      })
    )

    return config
  },

  webpackDevMiddleware: (config) => {
    return config
  },
}
