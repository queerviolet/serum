const test = require('.')

const chai = require('chai')
chai.use(require('chai-as-promised'))
const {expect} = chai

const {inject, watch, params, toIdentifier} = test._testPoints_

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

test `watch(func: any|any->any) -> {promise: Promise, run: any->any}`
  `resolves its promise with func's result when run is called` (() => {
    const watcher = watch(x => x)
    watcher.run(10)
    return expect(watcher.promise).to.eventually.equal(10)
  })

  `when given a non-function, immediately resolves with it` (() => {
    const watcher = watch(10)
    return expect(watcher.promise).to.eventually.equal(10)
  })
.end

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
  `injects immediate values` (a_value =>
    expect(a_value).to.equal(128)
  )

  `a promise` (Promise.resolve(42))
  `resolves and injects promises` (a_promise =>
    expect(a_promise).to.equal(42)
  )

  `a function` (() => Promise.resolve('lazy'))
  `calls and resolves functions` (a_function =>
    expect(a_function).to.equal('lazy')
  )
.end

