# electron-ipc-api

This module is designed to allow for easily designing modular/namespaced API's and expose them through electron's IPC functionality.

## Installation

```
npm install electron-ipc-api
```

## Usage
Example taken from test: 

`lib/api.js` - api declaration: 
```js
const IpcApi = require('electron-ipc-api');

const api = {
    ns1: {
        method1: function() { /* do something */ },
        method2: function() { /* do something */ },
    }
}

module.exports = new IpcApi(api);
```

`electron.js` - main electron file, runs in _main_ process
```js
const { app, BrowserWindow, ipcMain } = require('electron');
const api = require('.lib/api.js')

...

app.whenReady().then(() => {
    api.registerHandlers(ipcMain);
})

...
```

`preload.js` - electron preload file, exposes to _renderer_ process
```js

const { contextBridge, ipcRenderer } = require('electron');
const api = require('./lib/api.js');

...

contextBridge.exposeInMainWorld('api', api.getInvoker(ipcRenderer));
```

`client.js` - javascript running in the browser _renderer_ process
```js
...

const value = window.api.ns1.method1(/* params */);

...
```

## `IpcApi`

### Constructor

`IpcApi(api [, config])`
- `api` - an object containing, methods, properties, and namespaced properties to parse and register.
- `config` - object containing config options for the api
    - `includeBaseMethods` - **boolean** - if true any "base methods" (methods defined on the root api object, and not in a namespace) will be included in the generated api object. Base methods will be registered and have an invoker handler created for them just like namespaced methods.
    - `includeBaseProperties` - **array** - a list containing the names of base properties (any non-function and non-namespace properties defined on the root api object) to include in the generated api. Base properties will be included in the generated invoker, but wil not have any IPC functionality. You can use this to pass static data from the main to the render process.

### Instance Methods
`registerHandlers(ipcMain)` - register handlers in the main process using the provided `ipcMain` objects handle function. This sets up the main process to handle IPC requests from the renderer process
- `ipcMain` - the ipcMain object provided by electron

`getInvoker(ipcRenderer)` - generates and returns an api invoker object that includes namespaced methods and optionally base properties/methods, if configured to. The generated invoker will have the same structure as the originally passed `api` object, but any methods will automatically handle the calling of `ipcRenderer.invoke()`, passing params, and returning any return value that might exist.

## Test

```
npm test
```
