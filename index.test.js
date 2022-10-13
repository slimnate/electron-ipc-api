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

    test('it should register namespaced functions', () => {
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
