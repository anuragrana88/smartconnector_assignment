'use strict'

var _ = require('lodash')
var async = require('async')
var installerUtils = require('connector-utils').installerUtils
var util = require('util')
var AbstractVersionUpdate = require('connector-utils').AbstractVersionUpdate

function VersionUpdater(options) {
    this.updateLogic = updatelogic
    AbstractVersionUpdate.call(this, options)
}

util.inherits(VersionUpdater, AbstractVersionUpdate)

/**
 * Properties of "This" object:
 *         _bearerToken
 *         _integrationId
 *         _integration
 *         _version
 */
var updatelogic = function (callback) {
    installerUtils.logInSplunk('Inside updatelogic 1.0.1', 'info')

    try {
        createFlow.call(this, callback)
    } catch (e) {
        return callback(e)
    }
}

var createFlow = function (callback) {
    var that = this

    try {
        // iterate through store map
        var integrationBody = that._integration
        var storeMapArr = integrationBody.settings.storemap

        if (storeMapArr.length === 0) {
            return callback()
        }
        async.forEachOfSeries(storeMapArr, function (storeMap, storeMapIndex, cbForEachOfSeries) {
            var salesOrderExportId = null
            var salesOrderImportId = null
            var salesOrderFlowId = null

            async.series([
                function (cbSeries) { // create export for sales order
                    var data = {
                        'name': 'sales-order-export-adaptor',
                        'asynchronous': true,
                        'preserveOrder': false,
                        'type': 'once',
                        'once': {
                            'booleanField': 'custbody_cps_order_acknowledged'
                        },
                        'netsuite': {
                            'type': 'restlet',
                            'skipGrouping': true,
                            'statsOnly': false,
                            'restlet': {
                                'recordType': 'salesorder',
                                'searchId': 3834
                            }
                        },
                        '_connectionId': integrationBody.settings.commonresources.netsuiteConnectionId
                    }
                    var requestData = {
                        'resourcetype': 'exports',
                        'bearerToken': that._bearerToken,
                        'data': data
                    }
                    installerUtils.integratorRestClient(requestData, function (err, response, body) {
                        if (err) {
                            return cbSeries(err)
                        }
                        salesOrderExportId = body._id
                        return cbSeries()
                    })
                }, function (cbSeries) { // create imports cash sale
                    var data = {
                        'name': 'salesorder-import-adaptor',
                        'distributed': true,
                        '_connectionId': integrationBody.settings.commonresources.netsuiteConnectionId
                    }
                    var requestData = {
                        'resourcetype': 'imports',
                        'bearerToken': that._bearerToken,
                        'data': data
                    }
                    installerUtils.integratorRestClient(requestData, function (err, response, body) {
                        if (err) {
                            return cbSeries(err)
                        }
                        salesOrderImportId = body._id
                        // create import distributed adaptor
                        var data = {
                            'recordType': 'salesorder',
                            'lookups': [],
                            'mapping': {
                                'fields': [{
                                    'generate': 'custrecord223',
                                    'extract': 'name'
                                },
                                    {
                                        'generate': 'custrecord224',
                                        'extract': 'tranid'
                                    }
                                ],
                                'lists': []
                            },
                            'hooks': {
                                'preMap': {
                                    'fileInternalId': null,
                                    'function': null
                                },
                                'postMap': {
                                    'fileInternalId': null,
                                    'function': null
                                },
                                'postSubmit': {
                                    'fileInternalId': null,
                                    'function': null
                                }
                            },
                            'disabled': false,
                            'ioEnvironment': '',
                            'operation': 'add',
                            '_id': salesOrderImportId
                        }
                        var requestData = {
                            'resourcetype': 'imports',
                            'bearerToken': that._bearerToken,
                            'data': data,
                            'id': salesOrderImportId,
                            'distributed': true
                        }

                        installerUtils.integratorRestClient(requestData, function (err, response, body) {
                            if (err) {
                                return cbSeries(err)
                            }
                            return cbSeries()
                        })
                    })
                }, function (cbSeries) { // Create flow for sales order
                    var data = {
                        'disabled': true,
                        'name': 'NetSuite Order to NetSuite Order Summary',
                        '_exportId': salesOrderExportId,
                        '_importId': salesOrderImportId
                    }
                    var requestData = {
                        'resourcetype': 'flows',
                        'bearerToken': that._bearerToken,
                        'data': data
                    }
                    installerUtils.integratorRestClient(requestData, function (err, response, body) {
                        if (err) {
                            return cbSeries(err)
                        }
                        salesOrderFlowId = body._id
                        return cbSeries()
                    })
                }, function (cbSeries) { // update settings
                    console.log('inside sett changes')
                    var autoNewSettings = {
                        'flows': [{
                            '_id': salesOrderFlowId,
                            'showMapping': true,
                            'showSchedule': true
                        }
                        ],
                        'fields': [{
                            "tooltip": "By default all order will be exported, to override this functionality set this checkbox and sync orders created/updated since last time the flow ran.",
                            "name": 'exports_' + salesOrderExportId + '_exportDeltaOrders',
                            "type": "checkbox",
                            "value": false,
                            "label": "Export Delta Orders"
                        }
                        ]
                    }

                    var billingSync = {
                        'title': 'Billing',
                        'columns': 2,
                        'flows': autoNewSettings.flows,
                        'fields': autoNewSettings.fields
                    }
                    integrationBody.settings.sections.push(billingSync)
                    return cbSeries()
                }
            ], function (err) {
                if (err) {
                    return cbForEachOfSeries(err)
                }
                return cbForEachOfSeries()
            })
        }, function (err) {
            if (err) {
                return callback(err)
            }
            return callback()
        })
    } catch (e) {
        return callback(e)
    }
}

exports.VersionUpdater = VersionUpdater