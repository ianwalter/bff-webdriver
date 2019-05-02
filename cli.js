#!/usr/bin/env node

const cli = require('@ianwalter/cli')
const { Print } = require('@ianwalter/print')

async function run () {
  const config = cli({ name: 'bff' })
  const print = new Print({ level: config.logLevel })
  const { _: [command] } = config

  try {
    if (command === 'setup') {
      const selenium = require('selenium-standalone')
      await new Promise((resolve, reject) => {
        selenium.install({ logger: print }, err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    } else if (command === 'cleanup') {
      const cleanup = require('./cleanup')
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
