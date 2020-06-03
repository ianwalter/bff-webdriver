const merge = require('@ianwalter/merge')
const getText = require('./commands/getText')

module.exports = function enhanceElement (element, browser) {
  element.browser = browser
  element.getText = getText
  return element
}
