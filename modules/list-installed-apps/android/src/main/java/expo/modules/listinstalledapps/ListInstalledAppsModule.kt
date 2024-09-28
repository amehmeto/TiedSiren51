package expo.modules.listinstalledapps

import android.content.Context
import android.content.Intent
import android.content.pm.ResolveInfo
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ListInstalledAppsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ListInstalledApps")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello from Nicolas! 👋"
    }

    Function("listInstalledApps") {
      val appList = mutableListOf<Map<String, String>>()
      val context: Context = appContext.reactContext ?: throw IllegalStateException("Context is null")
      try {
        Log.d("ListInstalledAppsModule", "Starting to list installed apps")
        val mainIntent = Intent(Intent.ACTION_MAIN, null)
        mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
        val pkgAppsList: List<ResolveInfo> = context.getPackageManager().queryIntentActivities(mainIntent, 0)

        for (resolveInfo in pkgAppsList) {
          val appInfo = resolveInfo.activityInfo.applicationInfo
          val label = appInfo.loadLabel(context.getPackageManager()).toString()
          val packageName = appInfo.packageName
          appList.add(mapOf("label" to label, "packageName" to packageName))
          Log.d("ListInstalledAppsModule", "Found app: $label with package: $packageName")
        }

        Log.d("ListInstalledAppsModule", "Finished listing installed apps")
      } catch (e: Exception) {
        Log.e("ListInstalledAppsModule", "Error listing installed apps", e)
      }
      appList
    }
  }
}
