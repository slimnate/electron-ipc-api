const index = require('./index');

describe('Module', () => {
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