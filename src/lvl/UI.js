import .View;

var UI = Class("UI", View, function () {
  var superProto = View.prototype;

  // TODO: remove this if we don't need it
  this.init = function () {
    superProto.init.call(this);
  };

  // TODO: remove this if we don't need it
  this.reset = function () {};

  this.add = function (resource, opts) {
    var view = new UIView(resource);
    backend.addToUI(view, resource, opts);
    return view;
  };

  this.clear = function () {
    backend.clearUI();
  };
});

// singleton class
exports = new UI();



// UIView Class API returned by lvl.ui.add()
var UIView = Class("UIView", View, function () {
  var superProto = View.prototype;

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
