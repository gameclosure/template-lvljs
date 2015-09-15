var Background =  exports = Class(function() {
  
  this.init = function(opts) {
    var opts = opts || {}
    this._backend = opts.backend;
  }

  
  this.addLayer = function(resource) {
    backend.addBackgroundLayer(resource);
    
  }
  
  this.clear = function() {
    
  }
  
})


