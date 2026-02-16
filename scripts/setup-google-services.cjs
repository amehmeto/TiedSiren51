#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')

console.log('=== setup-google-services.js ===')
console.log('Current directory:', process.cwd())
const googleOrEasEnvVars = Object.keys(process.env).filter(
  (k) => k.includes('GOOGLE') || k.includes('EAS'),
)
console.log('Environment variables available:', googleOrEasEnvVars)

const googleServicesJson = process.env.GOOGLE_SERVICES_JSON
const expoRouterAppRoot = process.env.EXPO_ROUTER_APP_ROOT

if (!googleServicesJson) {
  console.error('❌ GOOGLE_SERVICES_JSON environment variable not found')
  console.error(
    'This script should only run in EAS Build context with the env var set',
  )
  process.exit(1)
}

if (googleServicesJson.startsWith('$')) {
  console.error('EXPO_ROUTER_APP_ROOT resolve to:', expoRouterAppRoot)
  console.error('❌ GOOGLE_SERVICES_JSON is not resolved (still contains $)')
  console.error('   Value:', googleServicesJson)
  console.error(
    '   This means the environment variable was not passed correctly',
  )
  // process.exit(1)
}

try {
  console.log('🔨 Decoding GOOGLE_SERVICES_JSON...')
  console.log('   Base64 length:', googleServicesJson.length)
  const base64Preview = googleServicesJson.substring(0, 50) + '...'
  console.log('   Base64 preview:', base64Preview)

  const decoded = Buffer.from(googleServicesJson, 'base64').toString('utf-8')
  const targetPath = path.join(process.cwd(), 'google-services.json')

  console.log('📝 Writing to:', targetPath)
  fs.writeFileSync(targetPath, decoded)
  console.log('✅ google-services.json created successfully')

  if (fs.existsSync(targetPath)) {
    const stats = fs.statSync(targetPath)
    console.log(`   File size: ${stats.size} bytes`)
    console.log('   File content preview:')
    console.log(decoded.substring(0, 200))
  }
} catch (error) {
  console.error('❌ Error creating google-services.json:', error.message)
  console.error('Stack:', error.stack)
  process.exit(1)
}
