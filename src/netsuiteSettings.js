'use strict';

var util = require('util')
    , EtailSettings = require('abstract-connector').EtailSettings
    , eTailSettingUtil = require('connector-utils')
    , logger = require('winston')
    , _ = require('lodash')
    , request = require('request')
    , jsonpath = require('jsonpath')
    , NETSUITE_CONSTANTS = require('./netsuiteConstants')
    , InstallerUtils = eTailSettingUtil.installerUtils

function NetSuiteSettings() {

    var self = this
        , Settings = new eTailSettingUtil.Settings();

    var listPrefixNames = function (paramObject, callback) {
        var results = [
            {id: 'Mr.', text: 'Mr. '},
            {id: 'Ms.', text: 'Ms. '},
            {id: 'Mrs.', text: 'Mrs. '}
        ]
        return callback(null, results)
    }

    var addPrefix = function (paramObject, callback) {
        logger.info('inside addPrefix setting, paramObject: ' + JSON.stringify(paramObject))
        var newSettings = paramObject.newSettings
            , settingParams = paramObject.settingParams
            , setting = paramObject.setting
            , options = paramObject.options

        var prefixValue = newSettings[setting]
            , importId = settingParams[1]
        InstallerUtils.getAdaptor({
            resourceType: 'imports'
            , resourceId: importId
            , bearerToken: options.bearerToken
        }, function (err, body) {
            if (err) return callback(err)
            try {
                var fields = body['mapping']['fields'] || [];
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (field['extract'].toLowerCase().lastIndexOf('name') > -1) {
                        field['extract'] = '{{join "" "' + prefixValue + '" Name}}';
                    }
                }
                InstallerUtils.putAdaptor({
                    resourceType: 'imports'
                    , resourceId: importId
                    , bearerToken: options.bearerToken
                    , body: body
                }, function (e, b) {
                    if (e) return callback(e)
                    return Settings.setFieldValues(paramObject, callback)
                })
            } catch (ex) {
                logger.info('addPrefix, unable to update import')
                return callback(new Error('Unable to update import. Exception : ' + ex.message))
            }
        })
    }

    var exportDelta = function(paramObject, callback){
        logger.info('inside exportDelta setting, paramObject: ' + JSON.stringify(paramObject))
        var newSettings = paramObject.newSettings
            , settingParams = paramObject.settingParams
            , setting = paramObject.setting
            , options = paramObject.options

        var isDelta = newSettings[setting]
            , exportId = settingParams[1]

            InstallerUtils.getAdaptor({
                resourceType: 'exports'
                , resourceId: exportId
                , bearerToken: options.bearerToken
            }, function (err, body) {
                if (err) return callback(err)
                try {
                    if(isDelta) {
                        body['type'] = 'delta';
                        body['delta'] = {};
                        body['delta']['dateField'] = 'lastmodifieddate';
                    }else{
                        delete body['type'];
                        delete body['delta'];
                    }
                    InstallerUtils.putAdaptor({
                        resourceType: 'exports'
                        , resourceId: exportId
                        , bearerToken: options.bearerToken
                        , body: body
                    }, function (e, b) {
                        if (e) return callback(e)
                        return Settings.setFieldValues(paramObject, callback)
                    })
                } catch (ex) {
                    logger.info('exportDelta, unable to update export')
                    return callback(new Error('Unable to update export. Exception : ' + ex.message))
                }
            })
    }

    this.getAmazonCustomSettings = function () {
        var settingsToBeRegistered = [
            {name: 'exportDelta', method: exportDelta}
            , {name: 'addPrefix', method: addPrefix}
        ]
            , refreshMetaDataFunctionsToBeRegistered = [
            {name: 'listPrefixNames', method: listPrefixNames}
        ]

        return {settings: settingsToBeRegistered, refreshMetaData: refreshMetaDataFunctionsToBeRegistered}
    }

    var isMultiSectionSettingsEnabled = false;
    EtailSettings.call(this, self.getAmazonCustomSettings(), isMultiSectionSettingsEnabled)
}

util.inherits(NetSuiteSettings, EtailSettings)

NetSuiteSettings.prototype.getConnectorConstants = function () {
    return NETSUITE_CONSTANTS
};

module.exports = NetSuiteSettings;