'use strict'
var utils = require('util')
    , AbstractEtailInstaller = require('abstract-connector').AbstractEtailInstaller
    , logger = require('winston')
    , installerUtils = require('connector-utils').installerUtils
    , NETSUITE_CONSTANTS    = require('./netsuiteConstants')
    , _ = require('lodash')
    , RefreshNSMetaDataUtil = require('connector-utils').RefreshNSMetaDataUtil

function NetSuiteInstaller(NETSUITE_CONSTANTS) {
    AbstractEtailInstaller.call(this)

    this.getConnectorConstants = function(){
        return NETSUITE_CONSTANTS
    }
}

utils.inherits(NetSuiteInstaller, AbstractEtailInstaller);

module.exports = NetSuiteInstaller;