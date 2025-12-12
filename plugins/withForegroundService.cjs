const {
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const withForegroundServiceDrawable = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const drawableDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'drawable',
      )

      if (!fs.existsSync(drawableDir)) {
        fs.mkdirSync(drawableDir, { recursive: true })
      }

      // Create a simple solid color drawable as placeholder for missing bgintro
      // This fixes the foreground-ss package bug where bgintro_layer.xml references
      // a non-existent @drawable/bgintro resource
      const bgintroXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <solid android:color="#0C207A"/>
</shape>
`
      const bgintroPath = path.join(drawableDir, 'bgintro.xml')
      fs.writeFileSync(bgintroPath, bgintroXml)

      return config
    },
  ])
}

const withForegroundServiceManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const permissions = [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
    ]

    if (!config.modResults.manifest['uses-permission'])
      config.modResults.manifest['uses-permission'] = []

    permissions.forEach((permission) => {
      const alreadyExists = config.modResults.manifest['uses-permission'].some(
        (item) => item.$['android:name'] === permission,
      )

      if (!alreadyExists) {
        config.modResults.manifest['uses-permission'].push({
          $: { 'android:name': permission },
        })
      }
    })

    const service = {
      $: {
        'android:name': 'expo.modules.foreground.ForegroundService',
        'android:enabled': 'true',
        'android:exported': 'true',
        'android:foregroundServiceType': 'dataSync',
      },
    }

    if (!config.modResults.manifest.application[0].service)
      config.modResults.manifest.application[0].service = []

    const hasService = config.modResults.manifest.application[0].service.some(
      (existingService) =>
        existingService.$['android:name'] ===
        'expo.modules.foreground.ForegroundService',
    )

    if (!hasService)
      config.modResults.manifest.application[0].service.push(service)

    return config
  })
}

const withForegroundService = (config) => {
  config = withForegroundServiceDrawable(config)
  config = withForegroundServiceManifest(config)
  return config
}

module.exports = withForegroundService
