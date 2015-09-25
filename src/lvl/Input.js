
var ALLOWED_EVENTS = [
  'touchstart',
  'touchend',
  'touchmove'
];

var Input = Class("Input", function () {
  var listeners = {};

  this.init = function () {
    for (var i = 0; i < ALLOWED_EVENTS.length; i++) {
      var eventName = ALLOWED_EVENTS[i];
      listeners[eventName] = [];
    }
    this.reset();
  };

  this.reset = function () {
    for (var eventName in listeners) {
      listeners[eventName].length = 0;
      backend.registerInputHandler(eventName, fireEvent);
    }
  };

  this.on = function (signal, callback, ctx) {
    if (ALLOWED_EVENTS.indexOf(signal) === -1) {
      throw new Error("Invalid input event:", signal, "Valid events art:", ALLOWED_EVENTS);
    }

    var listenerList = listeners[signal];
    if (listenerList.indexOf(callback) === -1) {
      callback._ctx = ctx;
      listenerList.push(callback);
    }
  };

  function fireEvent (eventName, eventData) {
    var listenerList = listeners[eventName];
    for (var i = 0; i < listenerList.length; i++) {
      var callback = listenerList[i];
      callback.call(callback._ctx, {
        x: eventData.x,
        y: eventData.y,
        id: eventData.id
      });
    }
  };
});

// singleton class
exports = new Input();
