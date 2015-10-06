
/**
 * Physics Module API
 */

var Physics = Class("Physics", function () {
  this.reset = function () {
    handlers = {
      collision: {}
    };
    eventHandlerShortcuts = {};
  };

  // add a collision handler that fires a callback when a and b collide
  this.addCollisionHandler = function (a, b, callback) {
    return new EventHandler(a, b, callback, 'collision');
  };

  // remove a collision handler that's tracking a and b
  this.removeCollisionHandler = function (a, b) {
    var collisionHandlers = handlers.collision;
    var id = getHandlerID(a, b);
    var handlerList = collisionHandlers[id];
    if (handlerList) {
      for (var i = handlerList.length - 1; i >= 0; i--) {
        handlerList[i].unregister();
      }
    }
  };

  this.removeAllEventHandlersFromSubject = function (subject) {
    for (var type in handlers) {
      var handlersByType = handlers[type];
      for (var uid in handlersByType) {
        var handlerList = handlersByType[uid];
        for (var i = 0; i < handlerList.length; i++) {
          var handler = handlerList[i];
          if (handler.subjectA === subject || handler.subjectB === subject) {
            handler.unregister();
          }
        }
      }
    }
  };

  // create a string shortcut to easily access events with certain objects
  this.createEventHandlerShortcut = function (shortcut, obj) {
    if (typeof shortcut !== 'string') {
      throw new Error("Event handler shortcuts must be strings:", shortcut);
    } else if (eventHandlerShortcuts[shortcut]) {
      throw new Error("Event handler shortcuts cannot be overwritten:", shortcut);
    }
    eventHandlerShortcuts[shortcut] = obj;
  };
});

// singleton physics API
exports = new Physics();



// TODO: other types of event handlers, like onEnters, onExits, onEntered, etc
var handlers = {
  collision: {}
};
var eventFunctions = {
  collision: 'collidesWith'
};
var eventHandlerShortcuts = {};

// check collisions each tick
backend.onTick(function (dt) {
  for (var type in handlers) {
    var handlersByType = handlers[type];
    for (var uid in handlersByType) {
      handleEventsByType(handlersByType[uid], type);
    }
  }
});

function handleEventsByType (handlerList, type) {
  var fnName = eventFunctions[type];
  for (var i = 0; i < handlerList.length; i++) {
    var handler = handlerList[i];
    var subjectA = handler.subjectA;
    var subjectB = handler.subjectB;
    var isGroupA = subjectA.__class__ === "Group";
    var isGroupB = subjectB.__class__ === "Group";
    if (isGroupA && isGroupB) {
      subjectA.forEach(function (actorA) {
        subjectB.forEach(function (actorB) {
          checkForEvent(actorA, actorB, handler, fnName);
        }, this);
      }, this);
    } else if (isGroupA) {
      subjectA.forEach(function (actorA) {
        checkForEvent(actorA, subjectB, handler, fnName);
      }, this);
    } else if (isGroupB) {
      subjectB.forEach(function (actorB) {
        checkForEvent(subjectA, actorB, handler, fnName);
      }, this);
    } else {
      checkForEvent(subjectA, subjectB, handler, fnName);
    }
  }
};

function checkForEvent (actorA, actorB, handler, fnName) {
  // TODO: comment this stuff it's confusing
  var a = actorA.entity || actorA;
  var b = actorB.entity || actorB;
  var aFn = a[fnName];
  var bFn = b[fnName];
  if (aFn) {
    aFn.call(a, b) && handler.callback(actorA, actorB);
  } else if (bFn) {
    bFn.call(b, a) && handler.callback(actorA, actorB);
  }
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
    var handlersByType = handlers[this.type];
    var list = handlersByType[this.id] || [];
    list.push(this);
    handlersByType[this.id] = list;
  };

  this.unregister = function () {
    var handlersByType = handlers[this.type];
    var list = handlersByType[this.id] || [];
    var index = list.indexOf(this);
    if (index >= 0) {
      list.splice(index, 1);
    }
    if (list.length === 0) {
      delete handlersByType[this.id];
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
