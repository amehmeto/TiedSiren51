module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-async-generator-functions',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@core': './core',
            '@infra': './infra',
            '@ui': './ui',
            '@app': './app',
            '@assets': './assets',
          },
        },
      ],
    ],
  }
}
