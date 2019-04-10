'use strict';

var AbstractEtailConnector = require('abstract-connector').AbstractEtailConnector
    , NetSuiteSettings = require('./netsuiteSettings')
    , NetSuiteInstaller = require('./netsuiteInstaller')
    , NETSUITE_CONSTANTS = require('./netsuiteConstants')
    , util = require('util');

function NetSuiteConnector() {
    AbstractEtailConnector.call(this);
    this.installer = new NetSuiteInstaller(NETSUITE_CONSTANTS);
}

util.inherits(NetSuiteConnector, AbstractEtailConnector);

NetSuiteConnector.prototype.getConnectorConstants = function() {
    return NETSUITE_CONSTANTS;
};

NetSuiteConnector.prototype.settings = new NetSuiteSettings();

module.exports = NetSuiteConnector;