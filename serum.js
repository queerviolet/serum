const acorn = require('acorn')

const serum =
  ({ describe=global.describe, it=global.it, xit=global.xit }={}) => {
    const suite = (...suiteTag) => {
      const title = String.raw(...suiteTag)
      const tests = []
      const injection = {}
      const test = (...testTag) => def => {
        const name = String.raw(...testTag)
        const watcher = watch(def)
        injection[toIdentifier(name)] = watcher.promise
        tests.push({
          def: watcher.run,
          params: params(def),
          name, it})
        return test
      }

      test.x = (...testTag) => def => {
        const name = String.raw(...testTag)
        injection[toIdentifier(name)] = new Error(`${name} is disabled`)
        tests.push({def, name, params: params(def), it: xit})
        return test        
      }

      Object.defineProperties(test, {
        end: {
          get() {
            return describe(
              title,
              () => tests.forEach(test =>
                  typeof test.def === 'function' &&
                    test.it(test.name, inject(injection, test.def, test.params)))
            )
          }
        }
      })
          
      return test
    }
    suite.config = config => serum(config)
    return suite
  }

const params = func => {
  if (typeof func !== 'function') return []
  return acorn.parse(`(${func.toString()})`)
    .body[0].expression.params
}

const inject = (injection, func, parameters=params(func)) =>
  () =>
    Promise.resolve(injection)
      .then(injection => 
        Promise.all(parameters.map(p => injection[p.name]))
      )
      .then(([...args]) => 
        func(...args)
      )

const toIdentifier = name => name.replace(/\s/g, '_')

const watch = func => {
  if (typeof func !== 'function') return {
    promise: Promise.resolve(func),
    run: ()=>func,
  }

  let run
  const promise = new Promise(
    (resolve, reject) => {
      run = (...args) => {          
        Promise.resolve(func(...args))
          .then(resolve)
          .catch(reject)
      }
    })
  return {run, promise}
}

module.exports = serum()
if (process.env.NODE_ENV === 'test') {
  Object.assign(module.exports, {_testPoints_:
    {inject, watch, params, toIdentifier}
  })
}
