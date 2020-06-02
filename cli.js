#!/usr/bin/env node

const cli = require('@ianwalter/cli')
const { Print } = require('@ianwalter/print')
const { webdriverVersion } = require('.')

async function run () {
  const config = cli({
    name: 'bff',
    options: {
      logLevel: {
        alias: 'l',
        default: 'info'
      }
    }
  })
  const print = new Print({ level: config.logLevel })
  const { _: [command] } = config

  try {
    if (command === 'setup') {
      const selenium = require('selenium-standalone')
      const { version = webdriverVersion, drivers } = config.webdriver || {}
      await new Promise((resolve, reject) => {
        selenium.install({ logger: print.log, version, drivers }, err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    } else if (command === 'cleanup') {
      const cleanup = require('./lib/cleanup')
      await cleanup()
    } else {
      print.error('Unknown command:', command)
      process.exit(1)
    }
  } catch (err) {
    print.error(err)
  }
}

run()
