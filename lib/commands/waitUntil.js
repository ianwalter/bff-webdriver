module.exports = function waitUntil (fn, timeout) {
  timeout = timeout || this.context.longTimeout

  let interval
  return Promise.race([
    new Promise((resolve, reject) => {
      interval = setInterval(
        async () => {
          try {
            const result = await fn()
            if (result) {
              clearInterval(interval)
              resolve(result)
            }
          } catch (err) {
            reject(err)
          }
        }
      )
    }),
    new Promise((resolve, reject) => setTimeout(
      () => {
        clearInterval(interval)
        reject(new Error(`waitUntil timed out after ${timeout}ms`))
      },
      timeout
    ))
  ])
}
