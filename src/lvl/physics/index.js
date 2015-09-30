
// TODO: other types of event handlers, like onEnters, onExits, onEntered, etc
var handlers = {
  collision: {}
};
var eventHandlerShortcuts = {};

// check collisions each tick
backend.onTick(bind(this, function () {
  // TODO: support groups as subjects
  var collisionHandlers = handlers.collision;
  for (var key in collisionHandlers) {
    var handlerList = collisionHandlers[key];
    for (var i = 0; i < handlerList.length; i++) {
      var handler = handlerList[i];
      var subjectA = handler.subjectA;
      var subjectB = handler.subjectB;
      var a = subjectA.entity || subjectA;
      var b = subjectB.entity || subjectB;
      if (a.collidesWith) {
        if (a.collidesWith(b)) {
          handler.callback(subjectA, subjectB);
        }
      } else if (b.collidesWith) {
        if (b.collidesWith(a)) {
          handler.callback(subjectA, subjectB);
        }
      }
    }
  }
}));




/**
 * Physics Module API
 */

// add a collision handler that fires a callback when a and b collide
exports.addCollisionHandler = function (a, b, callback) {
  return new EventHandler(a, b, callback, 'collision');
};

// remove a collision handler that's tracking a and b
exports.removeCollisionHandler = function (a, b) {
  var collisionHandlers = handlers.collision;
  var id = getHandlerID(a, b);
  var handlerList = collisionHandlers[id];
  if (handlerList) {
    for (var i = handlerList.length - 1; i >= 0; i--) {
      handlerList[i].unregister();
    }
  }
};

// create a string shortcut to easily access events with certain objects
exports.createEventHandlerShortcut = function (shortcut, obj) {
  if (typeof shortcut !== 'string') {
    throw new Error("Event handler shortcuts must be strings:", shortcut);
  } else if (eventHandlerShortcuts[shortcut]) {
    throw new Error("Event handler shortcuts cannot be overwritten:", shortcut);
  }
  eventHandlerShortcuts[shortcut] = obj;
};



// class used to track and manage events, like collisions, between two subject
var EventHandler = Class("EventHandler", function () {
  this.init = function (a, b, callback, type) {
    this.type = type || 'collision';
    this.subjectA = resolveObject(a);
    this.subjectB = resolveObject(b);
    this.id = getHandlerID(this.subjectA, this.subjectB);
    this.callback = callback || defaultCallbacks[this.type];
    this.register();
  };

  this.register = function () {
    var typeHandlers = handlers[this.type];
    var list = typeHandlers[this.id] || [];
    list.push(this);
    typeHandlers[this.id] = list;
  };

  this.unregister = function () {
    var typeHandlers = handlers[this.type];
    var list = typeHandlers[this.id] || [];
    var index = list.indexOf(this);
    if (index >= 0) {
      list.splice(index, 1);
    }
  };

  function resolveObject (obj) {
    if (typeof obj === 'string') {
      var found = eventHandlerShortcuts[obj];
      if (!found) {
        throw new Error("Invalid collision shortcut:", obj);
      } else {
        obj = found;
      }
    }
    return obj;
  };
});



// default event handler callbacks by type
var defaultCallbacks = {
  collision: function (a, b) {
    a = a.entity || a;
    b = b.entity || b;
    return a.resolveCollisionWith(b);
  }
};

// generate an EventHandler ID from two subjects
function getHandlerID (a, b) { return a.uid + '_' + b.uid; };
