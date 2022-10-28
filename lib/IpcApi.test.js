const { getIpcInvoker } = require('..');
const IpcApi = require('./IpcApi');

const api = {
    number: 1,
    str: 'asdf',
    objProp: { key: 'value' },
    func: function() {},
    ns1: {
        method1: function() {},
        method2: function() {},
    }
}

const CONFIGS = {
    default: IpcApi.defaultConfig,
    includeMethods : {
        includeBaseMethods: true
    },
    includeProperties : {
        includeBaseProperties: ['number', 'str', 'objProp']
    },
    includeBoth : {
        includeBaseMethods: true,
        includeBaseProperties: ['number', 'str', 'objProp']
    }
}

const getIpcMain = function() {
    return {
        handle: jest.fn()
    }
}

describe('IpcApi constructor', () => {

    test('it should create a new IpcApi instance', () => {
        const ipcApi = new IpcApi(api);
        expect(ipcApi).toBeInstanceOf(IpcApi);
    })

    test('it should have the provided api', () => {
        const ipcApi = new IpcApi(api);
        expect(ipcApi).toHaveProperty('api', api)
    })

    test('it should use default config if not provided', () => {
        const ipcApi = new IpcApi(api);
        expect(ipcApi).toHaveProperty('config', CONFIGS.default)
    })

    test('it should merge provided config with default config', () => {
        const config = CONFIGS.includeProperties;
        const expectedConfig = {
            includeBaseMethods: false,
            includeBaseProperties: CONFIGS.includeProperties.includeBaseProperties,
        }

        //test
        const ipcApi = new IpcApi(api, config);
        expect(ipcApi).toHaveProperty('config', expectedConfig);
    })
})

describe('IpcApi generateMeta', () => {

    // DEFAULT CONFIG
    describe('with default config', () => {
        const config = CONFIGS.default;

        test('it should include only the namespaced functions', () => {
            const expectedApiMeta = [
                {
                    namespace: 'ns1',
                    key: 'method1',
                    value: expect.any(Function)
                },
                {
                    namespace: 'ns1',
                    key: 'method2',
                    value: expect.any(Function)
                },
            ]
            const ipcApi = new IpcApi(api, config);

            expect(ipcApi.meta.length).toEqual(expectedApiMeta.length);

            expectedApiMeta.forEach((metaItem) => {
                expect(ipcApi.meta).toContainEqual(metaItem)
            })
        })
    })

    // CUSTOM CONFIG case 1
    describe('with includeBaseMethods=true and includeBaseProperties=[]', () => {
        const config = CONFIGS.includeMethods;

        test('it should include both the namespaced functions and base functions', () => {
            const expectedApiMeta = [
                {
                    namespace: 'ns1',
                    key: 'method1',
                    value: expect.any(Function)
                },
                {
                    namespace: 'ns1',
                    key: 'method2',
                    value: expect.any(Function)
                },
                {
                    namespace: null,
                    key: 'func',
                    value: expect.any(Function)
                },
            ]
            const ipcApi = new IpcApi(api, config)

            expect(ipcApi.meta.length).toEqual(expectedApiMeta.length);

            expectedApiMeta.forEach((metaItem) => {
                expect(ipcApi.meta).toContainEqual(metaItem)
            })

        })
    })

    // CUSTOM CONFIG case 2
    describe('with includeBaseMethods=true and includeBaseProperties=[number, string, objProp]', () => {
        const config = CONFIGS.includeBoth

        test('it should include both the namespaced functions and base functions', () => {
            const expectedApiMeta = [
                {
                    namespace: 'ns1',
                    key: 'method1',
                    value: expect.any(Function)
                },
                {
                    namespace: 'ns1',
                    key: 'method2',
                    value: expect.any(Function)
                },
                {
                    namespace: null,
                    key: 'func',
                    value: expect.any(Function)
                },
                {
                    namespace: null,
                    key: 'number',
                    value: api.number
                },
                {
                    namespace: null,
                    key: 'str',
                    value: api.str
                },
                {
                    namespace: null,
                    key: 'objProp',
                    value: api.objProp
                },
            ]
            const ipcApi = new IpcApi(api, config)

            expect(ipcApi.meta.length).toEqual(expectedApiMeta.length);

            expectedApiMeta.forEach((metaItem) => {
                expect(ipcApi.meta).toContainEqual(metaItem)
            })

        })
    })

    // CUSTOM CONFIG case 3
    describe('with includeBaseMethods=false and includeBaseProperties=[number, string, objProp]', () => {
        const config = CONFIGS.includeProperties;

        test('it should include both the namespaced functions and base functions', () => {
            const expectedApiMeta = [
                {
                    namespace: 'ns1',
                    key: 'method1',
                    value: expect.any(Function)
                },
                {
                    namespace: 'ns1',
                    key: 'method2',
                    value: expect.any(Function)
                },
                {
                    namespace: null,
                    key: 'number',
                    value: api.number
                },
                {
                    namespace: null,
                    key: 'str',
                    value: api.str
                },
                {
                    namespace: null,
                    key: 'objProp',
                    value: api.objProp
                },
            ]
            const ipcApi = new IpcApi(api, config)

            expect(ipcApi.meta.length).toEqual(expectedApiMeta.length);

            expectedApiMeta.forEach((metaItem) => {
                expect(ipcApi.meta).toContainEqual(metaItem)
            })

        })
    })


})

describe('IpcApi register', () => {

    describe('with default config', () => {
        const config = CONFIGS.default;

        test('it should not register base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);

            expect(ipcMain.handle).not.toHaveBeenCalledWith('number', api.number);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('str', api.str);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('objProp', api.objProp);
        })

        test('it should not register base level functions', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).not.toHaveBeenCalledWith('func', api.func);
        })
    
        test('it should register namespaced functions by calling ipcMain.handle with correct ipc name', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method1', api.ns1.method1);
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method2', api.ns1.method2);
        })
    })

    describe('with includeBaseMethods = true and includeBaseProperties = []', () => {
        const config = CONFIGS.includeMethods;
    
        test('it should not register base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).not.toHaveBeenCalledWith('number', api.number);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('str', api.str);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('objProp', api.objProp);
        })

        test('it should register base level functions', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).toHaveBeenCalledWith('func', api.func);
        })
    
        test('it should register namespaced functions by calling ipcMain.handle with correct ipc name', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method1', api.ns1.method1);
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method2', api.ns1.method2);
        })
    })

    describe('with includeBaseMethods = true and includeBaseProperties = [number, str, objProp]', () => {
        const config = CONFIGS.includeBoth;
    
        test('it should not register base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).not.toHaveBeenCalledWith('number', api.number);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('str', api.str);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('objProp', api.objProp);
        })

        test('it should register base level functions', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).toHaveBeenCalledWith('func', api.func);
        })
    
        test('it should register namespaced functions by calling ipcMain.handle with correct ipc name', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method1', api.ns1.method1);
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method2', api.ns1.method2);
        })
    })

    describe('with includeBaseMethods = false and includeBaseProperties = [number, str, objProp]', () => {
        const config = CONFIGS.includeProperties;
    
        test('it should not register base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).not.toHaveBeenCalledWith('number', api.number);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('str', api.str);
            expect(ipcMain.handle).not.toHaveBeenCalledWith('objProp', api.objProp);
        })

        test('it should not register base level functions', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).not.toHaveBeenCalledWith('func', api.func);
        })
    
        test('it should register namespaced functions by calling ipcMain.handle with correct ipc name', () => {
            const ipcApi = new IpcApi(api, config);
            const ipcMain = {
                handle: jest.fn()
            }
            ipcApi.register(ipcMain);
            
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method1', api.ns1.method1);
            expect(ipcMain.handle).toHaveBeenCalledWith('ns1:method2', api.ns1.method2);
        })
    })
})

describe('IpcApi getInvoker', () => {
    
    describe('with default config', () => {
        const config = CONFIGS.default;
        const ipcRenderer = {
            invoke: jest.fn()
        }
        const testProps = 'test prop';

        test('it should not include base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);

            expect(invoker).not.toHaveProperty('number', api.number);
            expect(invoker).not.toHaveProperty('str', api.str);
            expect(invoker).not.toHaveProperty('objProp', api.objProp);
        })
        
        test('it should not include base level methods', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).not.toHaveProperty('func', expect.any(Function));
        })
        
        test('it should include namespaced properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('ns1.method1', expect.any(Function));
            expect(invoker).toHaveProperty('ns1.method2', expect.any(Function));
        })

        test('it should make calls to ipcRenderer.invoke() when calling each method', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            invoker.ns1.method1(testProps);
            invoker.ns1.method2(testProps);

            expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method1', testProps)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method2', testProps)
        })
    })
    
    describe('with includeBaseMethods = true', () => {
        const config = CONFIGS.includeMethods;
        const ipcRenderer = {
            invoke: jest.fn()
        }
        const testProps = 'test prop';

        test('it should not include base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).not.toHaveProperty('number', api.number);
            expect(invoker).not.toHaveProperty('str', api.str);
            expect(invoker).not.toHaveProperty('objProp', api.objProp);
        })
        
        test('it should include base level methods', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('func', expect.any(Function));
        })
        
        test('it should include namespaced properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('ns1.method1', expect.any(Function));
            expect(invoker).toHaveProperty('ns1.method2', expect.any(Function));
        })

        test('it should make calls to ipcRenderer.invoke() when calling each method', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            invoker.func(testProps);
            invoker.ns1.method1(testProps);
            invoker.ns1.method2(testProps);

            expect(ipcRenderer.invoke).toHaveBeenCalledTimes(3);
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('func', testProps)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method1', testProps)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method2', testProps)
        })
    })
    
    describe('with includeBaseMethods = true and includeProperties = [number, str, objProp]', () => {
        const config = CONFIGS.includeBoth;
        const ipcRenderer = {
            invoke: jest.fn()
        }
        const testProps = 'test prop';

        test('it should include base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('number', api.number);
            expect(invoker).toHaveProperty('str', api.str);
            expect(invoker).toHaveProperty('objProp', api.objProp);
        })
        
        test('it should include base level methods', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('func', expect.any(Function));
        })
        
        test('it should include namespaced properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('ns1.method1', expect.any(Function));
            expect(invoker).toHaveProperty('ns1.method2', expect.any(Function));
        })

        test('it should make calls to ipcRenderer.invoke() when calling each method', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            invoker.func(testProps);
            invoker.ns1.method1(testProps);
            invoker.ns1.method2(testProps);

            expect(ipcRenderer.invoke).toHaveBeenCalledTimes(3);
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('func', testProps)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method1', testProps)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method2', testProps)
        })
    })
    
    describe('with includeBaseMethods = false and includeProperties = [number, str, objProp]', () => {
        const config = CONFIGS.includeProperties;
        const ipcRenderer = {
            invoke: jest.fn()
        }
        const testProps = 'test prop';

        test('it should include base level properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('number', api.number);
            expect(invoker).toHaveProperty('str', api.str);
            expect(invoker).toHaveProperty('objProp', api.objProp);
        })
        
        test('it should include base level methods', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).not.toHaveProperty('func', expect.any(Function));
        })
        
        test('it should include namespaced properties', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            expect(invoker).toHaveProperty('ns1.method1', expect.any(Function));
            expect(invoker).toHaveProperty('ns1.method2', expect.any(Function));
        })

        test('it should make calls to ipcRenderer.invoke() when calling each method', () => {
            const ipcApi = new IpcApi(api, config);
            const invoker = ipcApi.getInvoker(ipcRenderer);
            
            invoker.ns1.method1(testProps);
            invoker.ns1.method2(testProps);

            expect(ipcRenderer.invoke).toHaveBeenCalledTimes(2);
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method1', testProps)
            expect(ipcRenderer.invoke).toHaveBeenCalledWith('ns1:method2', testProps)
        })
    })
})