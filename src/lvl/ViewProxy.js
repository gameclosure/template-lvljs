
/**
 * ViewProxy
 * a wrapper class for backend views
 */
// TODO: rename to View
var ViewProxy = exports = Class("ViewProxy", function () {
  var ALLOWED_KEYS = {};

  this.init = function () {
    this._properties = {};
    this._propertyGetter = null;
    this._propertySetter = null;
  };

  this.onPropertyGet = function (cb) {
    this._propertyGetter = cb;
  };

  this.onPropertySet = function (cb) {
    this._propertySetter = cb;
  };

  this.update = function (opts) {
    for (var name in opts) {
      _setProperty.call(this, name, opts[name]);
    }
  };

  this.getProperties = function () {
    return this._properties;
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
    ALLOWED_KEYS[name] = true;
    Object.defineProperty(this, name, {
      enumerable: true,
      get: function () {
        return _getProperty.call(this, name);
      },
      set: function (value) {
        _setProperty.call(this, name, value);
      }
    });
  };

  function _getProperty (name) {
    var value = this._properties[name];
    if (value === undefined) {
      value = this._propertyGetter && this._propertyGetter(name);
    }
    return value;
  };

  function _setProperty (name, value) {
    if (ALLOWED_KEYS[name]) {
      this._properties[name] = value;
      this._propertySetter && this._propertySetter(name, value);
    }
  };
});
