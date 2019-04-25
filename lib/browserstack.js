module.exports = {
  options (capability) {
    capability['bstack:options'] = capability['bstack:options'] || {}
    return capability['bstack:options']
  },
  enhanceCapability (config, capability, test) {
    // Check to see if BrowserStack is enabled.
    if (config.browserstack) {
      // Get the BrowserStack options.
      const options = this.options(capability)

      // Tell BrowserStack the name of the test.
      options.name = test.name
    }
  }
}
