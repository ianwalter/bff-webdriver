const waitUntil = require('./commands/waitUntil')
const getElement = require('./commands/getElement')
// const getElements = require('./commands/getElements')

module.exports = function enhanceBrowser (context, browser) {
  browser.context = context
  browser.waitUntil = waitUntil
  browser.getElement = getElement
  // browser.getElements = getElements
}
