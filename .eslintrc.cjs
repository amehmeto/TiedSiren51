// https://docs.expo.dev/guides/using-eslint/
// ESM configuration file
module.exports = {
  extends: ['expo', 'prettier', 'plugin:no-switch-statements/recommended'],
  plugins: ['prettier', 'no-switch-statements'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'error',
    'no-switch-statements/no-switch': 'error',
    'lines-between-class-members': ['error', 'always'],
    'no-else-return': 'warn',
  },
}
