module.exports = async function getText () {
  return this.browser.getElementText(this.id)
}
