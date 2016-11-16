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
   const test = require('serum')
   test `a serum`
      `has many tests within it` (() =>
         expect(1).to.equal(1)
      )

      `you just make them template literals` (() =>
         expect(true).to.equal(true)
      )

      .x `you can disable tests with .x` (() =>
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