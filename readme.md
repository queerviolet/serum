Serum uses injection to simplify your async tests.

# Install

```sh
    npm install --save-dev serum
```

Or

```sh
    yarn add --dev serum
```

# Use

```javascript
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
```

You need to run your test with a test runner, like `mocha` or `jasmine`.

# Configuration

By default, serum wires itself up to `global.describe`, `global.it`, and `global.xit`.
This works for most test runners, but if you want something different, you can do that
by calling `.config` when you `require` it:

```javascript
   const lab = require('lab').script()         // Using the lab test runner
   const test = require('serum').config({
     describe: lab.describe,
     it: lab.it,
     xit: ()=>{},
   })
```