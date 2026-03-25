const requireAmehmetoPinning = require('./require-amehmeto-pinning')

module.exports = {
  meta: {
    name: 'eslint-plugin-local-rules',
    version: '1.0.0',
  },
  rules: {
    'require-amehmeto-pinning': requireAmehmetoPinning,
  },
}
