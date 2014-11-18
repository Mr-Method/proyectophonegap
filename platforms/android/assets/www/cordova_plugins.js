cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",
        "id": "com.phonegap.plugins.PushPlugin.PushNotification",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "file": "plugins/com.brodysoft.sqlitePlugin/www/SQLitePlugin.js",
        "id": "com.brodysoft.sqlitePlugin.SQLitePlugin",
        "clobbers": [
            "SQLitePlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.geolocation": "0.3.10",
    "com.phonegap.plugins.PushPlugin": "2.4.0",
    "com.brodysoft.sqlitePlugin": "1.0.3"
}
// BOTTOM OF METADATA
});