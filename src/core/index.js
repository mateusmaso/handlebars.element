import store from './store'
import parseHTML from './parseHTML'
import parseValue from './parseValue'
import registerElement from './registerElement'
import registerAttribute from './registerAttribute'

let elements = {};
let attributes = {};

export {
  store,
  elements,
  attributes,
  registerElement,
  registerAttribute,
  parseHTML,
  parseValue
}
