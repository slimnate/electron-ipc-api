const defaultConfig = {
    includeBaseMethods: false,
    includeBaseProperties: []
};

/**
 * Returns `true` if all the properties of `obj` are of type
 * `Function`, and `false` if there are any non-function properties.
 * @param {*} obj A potential namespace object
 * @returns `true` if the object is a valid namespace object, otherwise `false`
 */
const isNamespace = function (obj) {
    let isValid = true;
    Object.keys(obj).forEach(key => {
        if(typeof(obj[key]) !== 'function') isValid = false;
    })
    return isValid;
}

/**
 * Returns a value in the format of `namespace:key` if `namespace`
 * is non-null, otherwise returns `key`
 * @param {string | null} namespace Namespace of meta entry
 * @param {string} key key of meta entry
 * @returns normalized invoker key string
 */
const normalizeKey = function(namespace, key) {
    return namespace === null ? key : `${namespace}:${key}`;
}



const IpcApi = function(api, config, debug = false) {
    let self = this;
    self.api = api;
    self.config = {
        ...defaultConfig,
        ...config
    }
    self.meta = [];
    self.dbg = debug;
    self.debug = function(obj) {
        if(self.dbg) console.log(obj);
    }

    self.generateMeta = function () {
        self.debug({
            config,
            api: self.api
        })
        Object.keys(self.api)
        .forEach(key => {
            self.debug(`-- generating meta for ${key}`);
            const propType = typeof(self.api[key])

            if(propType === 'object') { // if property is an object, could be property or namespace
                if(isNamespace(self.api[key])) {
                    // if it's a namespace, add meta entry
                    self.debug('found namespace, generating meta objects');
                    Object.keys(self.api[key]).forEach(subKey => {
                        let meta = {
                            namespace: key,
                            key: subKey,
                            value: self.api[key][subKey]
                        }
                        self.meta.push(meta)
                    })
                } else if(self.config.includeBaseProperties.includes(key)) {
                    // if it's not a namespace, but key is configured as base property, add meta
                    self.debug('found included base property (object)');
                    self.meta.push({
                        namespace: null,
                        key: key,
                        value: self.api[key],
                    })
                }
            } else { // if not object, property could be function or base property
                if(propType === 'function' && self.config.includeBaseMethods) {
                    // if base functions are allowed, add meta
                    self.debug('found included base method');
                    self.meta.push({
                        namespace: null,
                        key: key,
                        value: self.api[key],
                    })
                }
                if(self.config.includeBaseProperties.includes(key)) {
                    // if key is configured as base property, add meta
                    self.debug('found included base property (non-object)');
                    self.meta.push({
                        namespace: null,
                        key: key,
                        value: self.api[key],
                    })
                }
            }
        })
    }

    self.register = function (ipcMain) {
        self.meta.forEach(({namespace, key, value}) => {
            if(namespace !== null) {
                // register namespaced function
                ipcMain.handle(normalizeKey(namespace, key), value);
            } else if (typeof(value) === 'function' && self.config.includeBaseMethods) {
                // register base function if configured to do so
                ipcMain.handle(key, value);
            }
        })
    }

    self.getInvoker = function (ipcRenderer) {
        let invoker = {}
        self.debug('generating invoker');
        self.meta.forEach(({namespace, key, value}) => {
            self.debug({namespace, key, value});
            // if namespace is not null, this is a namespaced method
            if(namespace !== null) {
                self.debug('found namespace')
                // create namespace if it does not exist on invoker
                if(invoker[namespace] === undefined) {
                    invoker[namespace] = {}
                }
                //generate invoker method
                invoker[namespace][key] = (props) => ipcRenderer.invoke(normalizeKey(namespace, key), props);
            // if namespace is null, it could be an object or
            } else {
                if(typeof(value) === 'function' && self.config.includeBaseMethods) {
                    self.debug('found base function')
                    // register base function invokers if configured
                    invoker[key] = (props) => ipcRenderer.invoke(normalizeKey(namespace, key), props);
                } else if (self.config.includeBaseProperties && self.config.includeBaseProperties.includes(key)) {
                    self.debug('found base property')
                    // add base properties to the invoker object
                    invoker[key] = value;
                }
            }
        })
        return invoker;
    }

    self.generateMeta();
    self.debug(self.meta);
}

module.exports = IpcApi;
module.exports.defaultConfig = defaultConfig;