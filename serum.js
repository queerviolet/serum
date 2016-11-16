const acorn = require('acorn')

const serum =
  ({ describe=global.describe, it=global.it, xit=global.xit }={}) => {
    const suite = (...suiteTag) => {
      const title = String.raw(...suiteTag)
      const tests = []
      const injection = {}
      const test = (...testTag) => def => {
        const name = String.raw(...testTag)
        injection[toIdentifier(name)] = def
        tests.push({def, name, it})
        return test
      }

      test.x = (...testTag) => def => {
        const name = String.raw(...testTag)
        injection[toIdentifier(name)] = def
        tests.push({def, name, it: xit})
        return test        
      }

      Object.defineProperties(test, {
        end: {
          get() {
            return describe(
              title,
              () => tests.forEach(test =>
                  typeof test.def === 'function' &&
                    test.it(test.name, inject(injection, test.def)))
            )
          }
        }
      })
          
      return test
    }
    suite.config = config => serum(config)
    return suite
  }

const test = module.exports = serum()

const inject = (injection, func) =>
  () =>
    Promise.resolve(injection)
      .then(injection => 
        Promise.all(params(func).map(p => injection[p.name]))
      )
      .then(([...args]) => func(...args))

const toIdentifier = name => name.replace(/\s/g, '_')

const watch = func => {
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

const chai = require('chai')
chai.use(require('chai-as-promised'))
const {expect} = chai

test `toIdentifier(input: String) -> String`
  `converts spaces to underscores` (() =>
    expect(toIdentifier('hello world')).to.eql('hello_world')
  )
.end


test `inject(injection: any, func: any->any) ~> any -> any`
  `injects immediate values` (() =>
    expect(inject({x: 'hello'}, x => x)()).to.eventually.equal('hello')
  )

  `injects promises, resolving them` (() =>
    expect(inject({x: Promise.resolve('hello')}, x => x)()).to.eventually.equal('hello')
  )  
.end

test `watch(func: any->any) -> {promise: Promise, run: any->any}`
  `resolves its promise with func's result when run is called` (() => {
    const watcher = watch(x => x)
    watcher.run(10)
    return expect(watcher.promise).to.eventually.equal(10)
  })
.end

const params = func =>
  acorn.parse(`(${func.toString()})`)
    .body[0].expression.params

test `params(func: Function) -> [Parameter]`
  `gets simple formal parameters to an arrow` (() => {
    const output = params((a, b, c) => {})
    expect(output).to.have.length(3)
    output.forEach(p => expect(p.type).to.equal('Identifier'))
    const [a, b, c] = output    
    expect(a.name).to.equal('a')
    expect(b.name).to.equal('b')
    expect(c.name).to.equal('c')
  })

  `gets simple formal parameters to an anonymous function` (() => {
    const output = params(function(a, b, c) {})
    expect(output).to.have.length(3)
    output.forEach(p => expect(p.type).to.equal('Identifier'))
    const [a, b, c] = output    
    expect(a.name).to.equal('a')
    expect(b.name).to.equal('b')
    expect(c.name).to.equal('c')    
  })

  `gets simple formal parameters to a named function` (() => {
    const output = params(function myFunction(a, b, c) {})
    expect(output).to.have.length(3)
    output.forEach(p => expect(p.type).to.equal('Identifier'))
    const [a, b, c] = output    
    expect(a.name).to.equal('a')
    expect(b.name).to.equal('b')
    expect(c.name).to.equal('c')    
  })  
.end

test `a serum`
  `has many tests within it` (() =>
    expect(1).to.equal(1)
  )
  
  `can flow tests together` (() =>
    expect(true).to.equal(true)
  )

  .x `disables tests with .x` (() =>
    expect(true).to.equal(false)
  )

  `a value` (128)
  `injects immediate values` ((a_value) =>
    expect(a_value).to.equal(128)
  )

  `a promise` (Promise.resolve(42))
  `resolves and injects promises` ((a_promise) =>
    expect(a_promise).to.equal(42)
  )

  `a function` (() => Promise.resolve('lazy'))
  `calls and resolves functions` 
.end

