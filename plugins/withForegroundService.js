const { withAndroidManifest } = require('@expo/config-plugins')

const withForegroundService = (config) => {
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

module.exports = withForegroundService
