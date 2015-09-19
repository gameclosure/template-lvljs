var backend = jsio('import .backend.timestep');

// initialize global Level API object
// XXX: TODO: FIXME: COMPILER BUG
var lvl = exports = jsio('import .Level', { context: { backend: backend } });
var lvl = exports = jsio('import .Level');

// Attach library modules to level API
// These need no initialization
// They have no knowledge of the 'level' object (no external state dependencies)

// XXX: TODO: FIXME: COMPILER BUG
lvl.resource = jsio('import .resource', { context: { backend: backend } });
lvl.resource = jsio('import .resource');

// XXX: TODO: FIXME: COMPILER BUG
lvl.sound = jsio('import .sound', { context: { backend: backend } });
lvl.sound = jsio('import .sound');

// XXX: TODO: FIXME: COMPILER BUG
lvl.shape = jsio('import .shape', { context: { backend: backend } });
lvl.shape = jsio('import .shape');

//lvl.startGame(...);
