
/**
 * View
 * a wrapper class for backend rendering
 */
var View = exports = Class("View", function () {
  this.init = function () {
    this._propertyGetter = null;
    this._propertySetter = null;
  };

  this.onPropertyGet = function (cb) {
    this._propertyGetter = cb;
  };

  this.onPropertySet = function (cb) {
    this._propertySetter = cb;
  };

  makeProxy.call(this, 'offsetX');
  makeProxy.call(this, 'offsetY');
  makeProxy.call(this, 'anchorX');
  makeProxy.call(this, 'anchorY');
  makeProxy.call(this, 'zIndex');
  makeProxy.call(this, 'r');
  makeProxy.call(this, 'width');
  makeProxy.call(this, 'height');
  makeProxy.call(this, 'scale');
  makeProxy.call(this, 'scaleX');
  makeProxy.call(this, 'scaleY');
  makeProxy.call(this, 'opacity');
  makeProxy.call(this, 'flipX');
  makeProxy.call(this, 'flipY');
  makeProxy.call(this, 'compositeOperation');

  function makeProxy (name) {
    Object.defineProperty(this, name, {
      enumerable: true,
      get: function () {
        return this._propertyGetter(name);
      },
      set: function (value) {
        this._propertySetter(name, value);
      }
    });
  };
});
