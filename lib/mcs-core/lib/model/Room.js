/**
 * @classdesc
 * Model class for rooms
 */

'use strict'

const C = require('../constants/Constants');

module.exports = class Room {
  constructor(id, emitter) {
    this.id = id;
    this._users = {};
    this._mcuUsers = {};
    this._emitter = emitter;
  }

  getUser (id) {
    return this._users[id];
  }

  getUsers () {
    return Object.keys(this._users).map(uk => this._users[uk].getUserInfo());
  }

  setUser (user) {
    this._users[user.id] = user;
    this._emitter.emit(C.EVENT.USER_JOINED, { roomId: this.id, user: user.getUserInfo() });
  }

  destroyUser(userId) {
    this._emitter.emit(C.EVENT.USER_LEFT, { roomId: this.id,  userId });
    delete this._users[userId];
  }
}
