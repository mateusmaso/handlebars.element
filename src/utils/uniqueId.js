export default function uniqueId() {
  var generate = function(bool) {
    var random = (Math.random().toString(16) + "000000000").substr(2, 8);
    return bool ? "-" + random.substr(0, 4) + "-" + random.substr(4, 4) : random;
  }

  return generate() + generate(true) + generate(true) + generate();
}
