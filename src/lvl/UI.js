
var UI = Class("UI", function () {
  // TODO: remove this if we don't need it
  this.init = function () {};

  // TODO: remove this if we don't need it
  this.reset = function () {};

  this.add = function (resource, opts) {
    var uid = backend.addToUI(resource, opts);
    return new UIView(resource, uid, opts);
  };

  this.clear = function () {
    backend.clearUI();
  };
});

// singleton class
exports = new UI();



// UIView Class API returned by lvl.ui.add()
var UIView = Class("UIView", function () {
  this.init = function (resource, uid, opts) {
    this.uid = uid;
    this.resource = resource;
    // TODO: do we need opts here?
  };

  this.setText = function (text) {
    var type = this.resource.getType();
    if (type !== 'imageText') {
      throw new Error("Can't setText with resource type", type);
    }
    backend.updateUI(this, 'setText', { text: text });
  };
});
