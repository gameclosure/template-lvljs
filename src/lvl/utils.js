
exports = {
  // define a property that throws an error if set
  addReadOnlyProperty: function (ctx, name, getter) {
    Object.defineProperty(ctx, name, {
      enumerable: true,
      configurable: false,
      get: getter,
      set: function () {
        var ctxName = this.__class__ ? this.__class__ + " " : "";
        throw new Error(ctxName + name + " is a read-only property!");
      }
    });
  },

  // define a property that validates the provided value before setting it
  addValidatedProperty: function (ctx, name, validate) {
    var _value;
    Object.defineProperty(ctx, name, {
      enumerable: true,
      configurable: false,
      get: function () { return _value; },
      set: function (value) {
        if (validate.call(ctx, value) !== false) {
          _value = value;
        }
      }
    });
  }
};
