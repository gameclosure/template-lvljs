jsio('import .Level');

var backend = jsio('import .backend.timestep');

// initialize a global Level API object
var level = exports = new Level({backend: backend});
// Attach library modules to level API
// These need no initialization
// They have no knowledge of the 'level' object (no external state dependencies)


level.resource = jsio('import .resource');
level.resource.setBackend(backend);

level.sound = jsio('import .sound');
level.sound.setBackend(backend);

//level.shape = jsio('import .shape');
///. ..

// Start the game
//level.startGame(...);




// properties

