var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = Context;


function Context() {
  this.actors = {};
  this.counts = {};
  EventEmitter.call(this);
}
inherits(Context, EventEmitter);

Context.prototype.sweep = function(actor) {
  // TODO should we keep track of sweeps so they don't happen concurrently for a single actor
  return new Sweep(actor, this.actors[actor] || {}, this);
};

Context.prototype.destroy = function(actor) {
  var resources = this.actors[actor] || {};
  var counts = this.counts;
  for (var resource in resources) {
    (!--counts[resource] && this.emit('garbage', resource));
  }
  delete this.actors[actor];
  return this;
}

function Sweep(actor, prev, context) {
  this.actor = actor;
  this.context = context;
  this.resources = {};
  this.prev = prev;
}

Sweep.prototype.count = function(resources) {
  if (typeof resources === 'string') {
    this.resources[resources] = true;
  } else {
    for (var i = 0; i < resources.length; i++) {
      this.resources[resources[i]] = true;
    }
  }
  return this;
};

Sweep.prototype.done = function() {
  var resources = this.resources;
  var prev = this.prev;
  var context = this.context;
  var counts = context.counts;
  var resource;

  for (resource in resources) {
    if (!prev[resource]) {
      counts[resource] |= 0;
      counts[resource]++;
    }
  }
  for (resource in prev) {
    if (!resources[resource]) (!--counts[resource] && context.emit('garbage', resource));
  }

  context.actors[this.actor] = resources;

  delete this.context;
  delete this.prev;
  delete this.resources;
};
