export function hold(key, value) {
  return store[key] = value;
}

export function release(key) {
  var value = store[key];
  delete store[key];
  return value;
}

export function keyFor(value) {
  for (var key in store) {
    if (store[key] == value) {
      return key;
    }
  }
}

let store = {hold, release, keyFor};

export default store;
