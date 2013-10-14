/*

index.js - "alldata-server-http": AllData HTTP server module

The MIT License (MIT)

Copyright (c) 2013 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var events = require('events'),
    http = require('http'),
    util = require('util');

/*
  * `options`: _Object_
    * `hostname`: _String_ _(Default: undefined)_ Hostname for the server to listen on. If not specified, the server will accept connections directed to any IPv4 address (`INADDR_ANY`).
    * `port`: _Integer_ _(Default: 8080)_ Port number for the server to listen on.
*/
var AllDataServer = module.exports = function AllDataServer (options) {
    var self = this;
    events.EventEmitter.call(self);

    options = options || {};

    self.hostname = options.hostname || 'localhost';
    self.port = options.port || 8080;

    self.server = null;
};

util.inherits(AllDataServer, events.EventEmitter);

/*
  * `options`: See `new AllDataServer(options)` `options`.
  * `callback`: See `allDataServer.listen(callback)` `callback`.
  * Return: _Object_ An instance of AllDataServer with server running.
*/
AllDataServer.listen = function listen (options, callback) {
    var allDataServer = new AllDataServer(options);
    allDataServer.listen(callback);
    return allDataServer;
};

/*
  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional 
          callback to call once the server is stopped.
*/
AllDataServer.prototype.close = function close (callback) {
    var self = this;
    if (self.server)
        self.server.close(callback);
};

/*
  * `callback`: _Function_ _(Default: undefined)_ `function () {}` Optional 
          callback to call once the server is up.
*/
AllDataServer.prototype.listen = function listen (callback) {
    var self = this;
    self.server = http.createServer(function (req, res) {
        if (req.method != "POST") {
            res.writeHead(405, {Allow: 'POST'}); // Method Not Allowed
            res.end();
            return; 
        }

        var data = "";
        var connectionOpen = true;

        req.on('data', function (chunk) {
            data += chunk.toString('utf8');
        });

        req.on('end', function () {
            try {
                data = JSON.parse(data);
                var putCallback = function putCallback (error) {
                    if (!connectionOpen)
                        return; // connection has been closed already

                    if (error) {
                        res.statusCode = 500;
                        res.end();
                        return;
                    }

                    res.statusCode = 201;
                    res.end();
                    return;
                };
                self.emit('put', data, putCallback);
            } catch (exception) {
                res.statusCode = 400; // Bad Request
                res.end();
                return;
            }
        });

        req.on('close', function () {
            // if this happened before we responded, the client does not care
            // about the status of the put
            connectionOpen = false;
        })
    });
    self.server.listen(self.port, self.hostname, callback);
};