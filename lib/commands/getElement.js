const enhanceElement = require('../enhanceElement')

module.exports = async function getElement (selector, timeout) {
  timeout = timeout || this.context.shortTimeout
  return this.waitUntil(
    async () => {
      const response = await this.findElement('css selector', selector)
      if (response) {
        const [entry] = Object.entries(response)
        const element = { id: entry[1] }
        return enhanceElement(element, this)
      }
    },
    timeout
  )
}
