const index = require('./index');
const IpcApi = require('./lib/IpcApi');


describe('Module exports', () => {
    test('it should export object - IpcApi', () => {
        expect(index).toBeInstanceOf(Function);
        expect(index).toEqual(IpcApi);
    })
})