const acorn = require('acorn')

const serum =
  ({ describe=global.describe, it=global.it, xit=global.xit }={}) => {
    const suite = parent => (...suiteTag) => {
      const title = String.raw(...suiteTag)
      const tests = []
      const children = []      
      const scope = parent ? Object.create(parent.scope) : {}
      const test = (...testTag) => def => {
        const name = String.raw(...testTag)
        const watcher = watch(def)
        scope[toIdentifier(name)] = watcher.promise
        tests.push({
          def: watcher.run,
          params: params(def),
          name, it})
        return test
      }

      test.x = (...testTag) => def => {
        const name = String.raw(...testTag)
        tests.push({def, name, params: params(def), it: xit})
        return test        
      }

      const makeDescribe = () => describe(title, () => {
        tests.forEach(test =>
          typeof test.def === 'function' &&
            test.it(test.name, inject(scope, test.def, test.params)))
        children.forEach(creator => creator())
      })
      
      Object.defineProperties(test, {
        test: {
          get() {
            return suite({scope, test, children})
          }
        },
        end: {
          get() {
            if (parent) {
              parent.children.push(makeDescribe)
              return parent.test
            }
            return makeDescribe()
          }
        }
      })
          
      return test
    }    
    suite.config = config => serum(config)(null)
    return suite(null)
  }

const params = func => {
  if (typeof func !== 'function') return []
  return acorn.parse(`(${func.toString()})`)
    .body[0].expression.params
}

const inject = (injection, func, parameters=params(func)) =>
  () => {
    const args = parameters.map(
      p =>
        Promise.resolve(injection[p.name])
          .catch(err => { throw new Error(`couldn't resolve ${p.name}: ${err}`) }))
    return Promise.all(args)
      .then(([...args]) => func(...args))
  }

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
        try {
          return Promise.resolve(func(...args))
            .then(resolve)
            .catch(reject)
        } catch (reason) {
          reject(reason)
          return Promise.reject(reason)
        }
      }
    })

  // Silence unhandled rejection errors
  promise.catch(err => err)
  return {run, promise}
}

module.exports = serum()
if (process.env.NODE_ENV === 'test') {
  Object.assign(module.exports, {_testPoints_:
    {inject, watch, params, toIdentifier}
  })
}
