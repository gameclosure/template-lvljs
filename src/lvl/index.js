jsio('import .Level');

var backend = jsio('import .backend.timestep');

// initialize a global Level API object
var level = exports = new Level(backend);

// Attach library modules to level API
// These need no initialization
// They have no knowledge of the 'level' object (no external state dependencies)

// XXX: TODO: FIXME: COMPILER BUG
level.resource = jsio('import .resource', { context: { backend: backend } });
level.resource = jsio('import .resource');

// XXX: TODO: FIXME: COMPILER BUG
level.sound = jsio('import .sound', { context: { backend: backend } });
level.sound = jsio('import .sound');

//level.shape = jsio('import .shape');

//level.startGame(...);
