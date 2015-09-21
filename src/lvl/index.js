var backend = jsio('import .backend.timestep');

// initialize global Level API object
// XXX: TODO: FIXME: COMPILER BUG
var lvl = exports = jsio('import .Level', { context: { backend: backend } });
var lvl = exports = jsio('import .Level');

// Attach library modules to level API
// These need no initialization
// They have no knowledge of the 'level' object (no external state dependencies)

// XXX: TODO: FIXME: COMPILER BUG
lvl.resources = jsio('import .resources', { context: { backend: backend } });
lvl.resources = jsio('import .resources');

// XXX: TODO: FIXME: COMPILER BUG
lvl.sounds = jsio('import .sounds', { context: { backend: backend } });
lvl.sounds = jsio('import .sounds');

// XXX: TODO: FIXME: COMPILER BUG
lvl.shapes = jsio('import .shapes', { context: { backend: backend } });
lvl.shapes = jsio('import .shapes');

//lvl.startGame(...);
