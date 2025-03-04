// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error',
  },
}
