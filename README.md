# alldata-server-http

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/alldata-server-http.png)](http://npmjs.org/package/alldata-server-http)

Server HTTP module for [AllData](https://github.com/tristanls/alldata), a distributed master-less append-only immutable event store database implementing "All Data" part of [Lambda Architecture](http://www.slideshare.net/nathanmarz/runaway-complexity-in-big-data-and-a-plan-to-stop-it).

## Usage

```javascript
var AllDataServer = require('alldata-server-http');
var allDataServer = new AllDataServer({
    hostname: 'localhost',
    port: 8080
});

allDataServer.on('put', function (event, callback) {
    console.log('received request to put: ' + event); 
    // process the event
    callback(); // indicate success
});

allDataServer.listen(function () {
    console.log('server listening...'); 
});

```

## Test

    npm test

## Overview

AllDataServer will listen to HTTP `POST` requests containing the event encoded as a JSON string in the POST body.

## Documentation

### AllDataServer

**Public API**

  * [AllDataServer.listen(options, \[callback\])](#alldataserverlistenoptions-callback)
  * [new AllDataServer(options)](#new-alldataserveroptions)
  * [allDataServer.close(\[callback\])](#alldataserverclosecallback)
  * [allDataServer.listen(\[callback\])](#alldataserverlistencallback)
  * [Event 'put'](#event-put)

#### AllDataServer.listen(options, [callback])

  * `options`: See `new AllDataServer(options)` `options`.
  * `callback`: See `allDataServer.listen(callback)` `callback`.
  * Return: _Object_ An instance of AllDataServer with server running.

Creates new AllDataServer and starts the server.

#### new AllDataServer(options)

  * `options`: _Object_
    * `hostname`: _String_ _(Default: undefined)_ Hostname for the server to listen on. If not specified, the server will accept connections directed to any IPv4 address (`INADDR_ANY`).
    * `port`: _Integer_ _(Default: 8080)_ Port number for the server to listen on.

Creates a new AllDataServer instance.

#### allDataServer.close([callback])

  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional callback to call once the server is stopped.

Stops the server from accepting new connections.

#### allDataServer.listen([callback])

  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional callback to call once the server is up.

Starts the server to listen to new connections.

#### Event `put`

  * `function (event, callback) {}`
    * `event`: _Object_ JavaScript object representation of the event to put.
    * `callback`: _Function_ `function (error) {}` The callback to call with an error or success of the `put` operation.

Emitted when the server receives a new `put` request from a client.

Signal error via `callback(true)` and success via `callback()`.

```javascript
allDataServer.on('put', function (event, callback) {
    console.log('received request to put: ' + event); 
    // ... process the put
    callback();
});
```