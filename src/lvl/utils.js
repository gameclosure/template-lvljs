
exports = {
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
  }
};
