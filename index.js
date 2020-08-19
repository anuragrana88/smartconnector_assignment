'use strict';
var expressExtension = require('express-integrator-extension');
var functions = require('./functions');

var systemToken = 'XXXX'; // Set this value to the systemToken of the stack created in integrator.io
var options = {
    connectors: {
        '5ca2e8a82c14ff0838165e1e': functions
    },
    // connectors: { _connectorId: functions }, // for connectors
    systemToken: systemToken,
    port: 7000
};

expressExtension.createServer(options, function (err) {

});
