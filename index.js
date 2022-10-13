let config = {
    // default config
}

function configure(config) {
    //TODO
}

/**
 * Register IPC event handlers for the given `api` object.
 * 
 * @param {*} ipcMain electron ipcMain module
 * @param {*} api object containing the api namespaces and methods to be registered.
 */
function registerIpcHandlers(ipcMain, api) {
    Object.keys(api).forEach((prefix) => {
        // ignore base level functions (like configure)
        if (typeof api[prefix] === 'function') {
            return;
        }
        // Iterate keys of
        Object.keys(api[prefix]).forEach((funcName) => {
            console.log(`registering handler for ${prefix}:${funcName}`)
            ipcMain.handle(`${prefix}:${funcName}`, api[prefix][funcName]);
        })
    });
}

function getIpcInvoker() {
    //TODO
}

module.exports = {
    configure,
    registerIpcHandlers,
    getIpcInvoker,
}