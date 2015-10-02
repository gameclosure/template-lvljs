import .ViewProxy;

var UI = Class("UI", function () {
  // TODO: remove this if we don't need it
  this.init = function () {};

  // TODO: remove this if we don't need it
  this.reset = function () {};

  this.add = function (resource, opts) {
    var proxy = new UIView(resource);
    backend.addToUI(proxy, resource, opts);
    return proxy;
  };

  this.clear = function () {
    backend.clearUI();
  };
});

// singleton class
exports = new UI();



// UIView Class API returned by lvl.ui.add()
var UIView = Class("UIView", ViewProxy, function () {
  var superProto = ViewProxy.prototype;

  this.init = function (resource) {
    superProto.init.call(this);

    this.resource = resource;
  };

  this.setText = function (text) {
    var type = this.resource.getType();
    if (type !== 'imageText') {
      throw new Error("Can't setText with resource type", type);
    }
    backend.updateUI(this, 'setText', { text: text });
  };
});
