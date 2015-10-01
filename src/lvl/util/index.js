var floor = Math.floor;
var random = Math.random;

exports.shuffle = function (array) {
  var curr = array.length;
  while (curr > 0) {
    var rand = floor(random() * curr);
    var temp = array[--curr];
    array[curr] = array[rand];
    array[rand] = temp;
  }
  return array;
};

// TODO: bring in all the other useful game dev functions
