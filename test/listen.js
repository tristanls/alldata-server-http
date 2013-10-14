/*

listen.js - listen(callback) test

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

var AllDataServer = require('../index.js'),
    assert = require('assert'),
    http = require('http');

var test = module.exports = {};

test['listen() starts an HTTP server on localhost:8080 by default'] = function (test) {
    test.expect(1);
    var allDataServer = new AllDataServer();
    allDataServer.listen(function () {
        var req = http.request({
            hostname: 'localhost', 
            method: 'POST',
            port: 8080
        });
        req.on('error', function (e) {
            console.dir(e);
            assert.fail(e);
        });
        req.on('response', function (res) { 
            res.on('data', function (chunk) {}); // consume any and all data
            res.on('end', function () {
                test.ok(true); // connected
                allDataServer.close(function () {
                    test.done();
                });
            })
        });
        req.end();
    });
};

test['listen() starts an HTTP server on hostname:port from options'] = function (test) {
    test.expect(1);
    var allDataServer = new AllDataServer({
        hostname: '127.0.0.1',
        port: 8081
    });
    allDataServer.listen(function () {
        var req = http.request({
            hostname: '127.0.0.1', 
            method: 'POST',
            port: 8081
        });
        req.on('error', function (e) {
            console.dir(e);
            assert.fail(e);
        });
        req.on('response', function (res) { 
            res.on('data', function (chunk) {}); // consume any and all data
            res.on('end', function () {
                test.ok(true); // connected
                allDataServer.close(function () {
                    test.done();
                });
            })
        });
        req.end();
    });
};

test['listen() emits `put` event when it receives a POST with valid JSON body'] = function (test) {
    test.expect(1);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        test.deepEqual(event, {foo: 'bar', baz: 1});
        callback();
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "POST",
            port: 8080
        });
        req.on('response', function (res) {
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write(JSON.stringify({foo: 'bar', baz: 1}));
        req.end();
    });
};

test['listen() does not emit `put` if not POST request'] = function (test) {
    test.expect(0);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        assert.fail("`put` event emitted");
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "GET",
            port: 8080
        });
        req.on('response', function (res) {
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write(JSON.stringify({foo: 'bar', baz: 1}));
        req.end();
    });
};

test['listen() responds with 405 Method Not Allowed and Allow: POST header set if not POST request'] = function (test) {
    test.expect(2);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        assert.fail("`put` event emitted");
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "GET",
            port: 8080
        });
        req.on('response', function (res) {
            test.equal(res.statusCode, 405);
            test.equal(res.headers.allow, 'POST');
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write(JSON.stringify({foo: 'bar', baz: 1}));
        req.end();
    });
};

test['listen() does not emit `put` if POST has invalid JSON body'] = function (test) {
    test.expect(0);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        assert.fail("`put` event emitted");
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "POST",
            port: 8080
        });
        req.on('response', function (res) {
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write("{foo: 'bar', baz: 1}");
        req.end();
    });
};

test['listen() responds with 400 Bad Request if POST has invalid JSON body'] = function (test) {
    test.expect(1);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        callback(true);
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "POST",
            port: 8080
        });
        req.on('response', function (res) {
            test.equal(res.statusCode, 400);
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write("{foo: 'bar', baz: 1}");
        req.end();
    });
};

test['listen() responds with 500 Internal Server Error if `put` event callback is called with error set'] = function (test) {
    test.expect(1);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        callback(true);
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "POST",
            port: 8080
        });
        req.on('response', function (res) {
            test.equal(res.statusCode, 500);
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write(JSON.stringify({foo: 'bar', baz: 1}));
        req.end();
    });
};

test['listen() responds with 201 Created if `put` event callback is called with no error'] = function (test) {
    test.expect(1);
    var allDataServer = new AllDataServer();
    allDataServer.on('put', function (event, callback) {
        callback();
    });
    allDataServer.listen(function () {
        var req = http.request({
            method: "POST",
            port: 8080
        });
        req.on('response', function (res) {
            test.equal(res.statusCode, 201);
            res.on('data', function () {}); // consume any and all data
            res.on('end', function () {
                allDataServer.close(function () {
                    test.done();
                });
            });
        });
        req.write(JSON.stringify({foo: 'bar', baz: 1}));
        req.end();
    });
};