const devtools = require('@vue/devtools');
const {isAndroid} = require('tns-core-modules/platform')

/**
 * Returns the correct address for the host machine when running on emulator
 * @param host
 * @param port
 * @returns {string}
 */
function getServerIpAddress(host, port) {
  if (host) {
    return `${host}:${port}`
  }

  if (isAndroid) {
    const FINGERPRINT = android.os.Build.FINGERPRINT
    if (FINGERPRINT.includes("vbox")) {
      // running on genymotion
      return `10.0.3.2:${port}`
    } else if (FINGERPRINT.includes("generic")) {
      // running on android emulator
      return `10.0.2.2:${port}`
    }
  }

  // ios or android device use `localhost`
  return `localhost:${port}`
}

module.exports = function install(Vue, options = {debug: false, host: null, port: 8098}) {
  const startApp = Vue.prototype.$start

  Vue.prototype.$start = function () {
    devtools.connect('ws://localhost', options.port, {
      app: this,
      showToast: (message) => require('nativescript-toast').makeText(message).show(),
      io() {
        const addr = `http://${getServerIpAddress(options.host, options.port)}`
        const SocketIO = require('nativescript-socket.io')
        options.debug && SocketIO.enableDebug()

        return SocketIO.connect(addr)
      }
    })

    devtools.init(Vue);

    return startApp.call(this)
  }
}