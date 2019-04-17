'use strict';

var _ = require('lodash'),
    CONNECTOR_CONSTANTS = require('abstract-connector').CONNECTOR_CONSTANTS,
    installerHelperUtil = require('connector-utils').installerUtils

    , INSTALLER_CONSTANTS = {
        INSTALL_CONNECTOR_METADATA: 'GitHub/sc_installer/configs/meta/installConnector'
        , VERIFY_PRODUCT_CONNECTION_METADATA: 'GitHub/sc_installer/configs/meta/verifyProductConnection'
        , VERIFY_PRODUCT_BUNDLE_METADATA: 'GitHub/sc_installer/configs/meta/verifyProductInstall'
        , CONNECTOR_BUNDLE_ID: '20038'
        , BUNDLE_SOURCE_ACCOUNT_ID: 'TSTDRV916910'
    }
    , NETSUITE_CONSTANTS = {
        NETSUITE_CONNECTORID: '5ca2e8a82c14ff0838165e1e'
        , UPDATE_CODE_REPO: '../updateCodeRepo/1.0.1'
    };

_.each(INSTALLER_CONSTANTS, function (v, k) {
    if (!NETSUITE_CONSTANTS.hasOwnProperty(k))
        NETSUITE_CONSTANTS[k] = v
});

_.each(CONNECTOR_CONSTANTS, function (v, k) {
    if (!NETSUITE_CONSTANTS.hasOwnProperty(k))
        NETSUITE_CONSTANTS[k] = v
});

module.exports = NETSUITE_CONSTANTS;