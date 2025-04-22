module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
  }
}

// Fix Android build error
process.env.EXPO_ROUTER_APP_ROOT = './app';