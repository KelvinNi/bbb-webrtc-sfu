"use strict";

const C = require('../bbb/messages/Constants');
const Logger = require('../utils/Logger');
const EventEmitter = require('events').EventEmitter;
const errors = require('../base/errors');
const config = require('config');
const MULTIPROCESS = config.get('multiprocess');

module.exports = class BaseProvider extends EventEmitter {
  constructor () {
    super();
    this.sfuApp = "base";
  }

  sendToClient (message, channel) {
    if (MULTIPROCESS) {
      this._bbbGW.publish(JSON.stringify(message), channel);
      return;
    }
    GLOBAL.CM_ROUTER.emit(C.REDIS_MESSAGE, message);
  }

  getRecordingPath (room, subPath, recordingName) {
    const format = config.get('recordingFormat');
    const basePath = config.get('recordingBasePath');
    const timestamp = (new Date()).getTime();

    return `${basePath}/${subPath}/${room}/${recordingName}-${timestamp}.${format}`
  }

  _handleError (logPrefix, error, role, streamId) {
    if (this._validateErrorMessage(error)) {
      return error;
    }

    const { code } = error;
    const reason = errors[code];

    if (reason == null) {
      return;
    }

    error.message = reason;

    Logger.debug(logPrefix, "Handling error", error.code, error.message);
    Logger.trace(logPrefix, error.stack);

    return this._assembleErrorMessage(error, role, streamId);
  }

  _assembleErrorMessage (error, role, streamId) {
    return {
      type: this.sfuApp,
      id: 'error',
      role,
      streamId,
      code: error.code,
      reason: error.message,
    };
  }

  _validateErrorMessage (error) {
    const {
      type = null,
      id = null,
      role = null,
      streamId = null,
      code = null,
      reason = null,
    } = error;
    return type && id && role && streamId && code && reason;
  }
};
