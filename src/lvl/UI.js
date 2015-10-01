
var UI = Class("UI", function () {
  // TODO: remove this if we don't need it
  this.init = function () {};

  // TODO: remove this if we don't need it
  this.reset = function () {};

  this.add = function (resource, opts) {
    // TODO: provide an API for devs to setText, etc
    backend.addToUI(resource, opts);
  };

  this.clear = function () {
    backend.clearUI();
  };
});

// singleton class
exports = new UI();
