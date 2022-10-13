const index = require('./index');

const testAPI = {
    nonRegisteredProperty: '',
    nonRegisteredFunc: () => { /* This function should not be exported */ },
    namespaceOne: {
        registeredFuncOne: () => { },
        registeredFuncTwo: () => { }
    },
    namespaceTwo: {
        registeredFuncOne: () => { },
        registeredFuncTwo: () => { }
    },
}

describe('Module exports', () => {
    test('it should export method - registerIpcHandlers', () => {
        expect(index.registerIpcHandlers).toBeInstanceOf(Function);
    })

    test('it should export method - getIpcInvoker', () => {
        expect(index.getIpcInvoker).toBeInstanceOf(Function);
    })

    test('it should export method - configure', () => {
        expect(index.configure).toBeInstanceOf(Function);
    })
})

describe('registerIpcHandlers', () => {
    const ipcMain = {
        handle: jest.fn()
    }

    index.registerIpcHandlers(ipcMain, testAPI);

    test('it should not register base level properties', () => {
        expect(ipcMain.handle).not.toHaveBeenCalledWith('nonRegisteredProperty', testAPI.nonRegisteredProperty);
    })

    test('it should not register base level functions', () => {
        expect(ipcMain.handle).not.toHaveBeenCalledWith('nonRegisteredFunc', testAPI.nonRegisteredFunc);
    })

    test('it should register namespaced functions by calling ipcMain.handle with correct ipc name', () => {
        expect(ipcMain.handle).toHaveBeenCalledTimes(4)
        expect(ipcMain.handle).toHaveBeenCalledWith(
            'namespaceOne:registeredFuncOne', testAPI.namespaceOne.registeredFuncOne);
        expect(ipcMain.handle).toHaveBeenCalledWith(
            'namespaceOne:registeredFuncTwo', testAPI.namespaceOne.registeredFuncTwo);
        expect(ipcMain.handle).toHaveBeenCalledWith(
            'namespaceTwo:registeredFuncOne', testAPI.namespaceTwo.registeredFuncOne);
        expect(ipcMain.handle).toHaveBeenCalledWith(
            'namespaceTwo:registeredFuncTwo', testAPI.namespaceTwo.registeredFuncTwo);
    })
})

describe('getIpcInvoker', () => {
    const ipcRenderer = {
        invoke: jest.fn()
    }
    const invoker = index.getIpcInvoker(ipcRenderer, testAPI);

    test('it should not contain base level properties', () => {
        expect(invoker).not.toHaveProperty('nonRegisteredProperty')
    })

    test('it should not contain base level functions', () => {
        expect(invoker).not.toHaveProperty('nonRegisteredFunc')
    })

    test('it should contain invoker methods for every namespaced method in the correct format', () => {
        expect(invoker).toHaveProperty('namespaceOne.registeredFuncOne', expect.any(Function))
        expect(invoker).toHaveProperty('namespaceOne.registeredFuncTwo', expect.any(Function))
        expect(invoker).toHaveProperty('namespaceTwo.registeredFuncOne', expect.any(Function))
        expect(invoker).toHaveProperty('namespaceTwo.registeredFuncTwo', expect.any(Function))
    })

    test('it should call ipcRenderer.invoke with correct arguments when invoker methods are called', () => {
        const testParams=[
            5,
            'test param',
            { test: 'param'},
            [1,2,3,4,5],
        ]
        invoker.namespaceOne.registeredFuncOne(testParams[0])
        invoker.namespaceOne.registeredFuncTwo(testParams[1])
        invoker.namespaceTwo.registeredFuncOne(testParams[2])
        invoker.namespaceTwo.registeredFuncTwo(testParams[3])

        expect(ipcRenderer.invoke).toHaveBeenCalledTimes(4)
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('namespaceOne:registeredFuncOne', testParams[0])
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('namespaceOne:registeredFuncTwo', testParams[1])
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('namespaceTwo:registeredFuncOne', testParams[2])
        expect(ipcRenderer.invoke).toHaveBeenCalledWith('namespaceTwo:registeredFuncTwo', testParams[3])
    })
})