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
  
  `accepts tests as tagged template literals` (() =>
    expect(true).to.equal(true)
  )

  .x `disables tests with .x` (() =>
    expect(true).to.equal(false)
  )

  .test `supports nesting`
    .test `to any depth`
      .test `so we could keep going`
        .test `and going`
          `until we test something` (() =>
            expect(1).to.equal(1)
          )
        .end
      .end
    .end
  .end

  .test `injection —`
    `x` (128)
    `injects immediate values by their argument name` (x =>
        expect(x).to.equal(128)
    )

    `name with spaces` ('hi there')
    `converts spaces to underscores` (name_with_spaces =>
      expect(name_with_spaces).to.equal('hi there')
    )

    `a promise` (Promise.resolve(42))
    `resolves promises before injection` (a_promise =>
        expect(a_promise).to.equal(42)
    )

    `a function` (() => Promise.resolve('lazy'))
    `calls functions and resolves their results before injection` (a_function =>
        expect(a_function).to.equal('lazy')
    )
  .end
.end
