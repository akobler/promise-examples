
### Application stabilization with Q Promises

#### Motivation
* all IO in node is asynchronous -> mastering async code is prerequisite for stabilization

#### Biggest advantages of promises over plain callbacks, async.js etc. (opinionated)
* generalized error handling/propagation
* flexibility of chaining, nesting, early escaping, etc.

#### Mental model
* chain of (pending) results
* if error occurs, it is propagated until the next catch()
* keep in mind: each then- or catch-handle is processed in a different event in the event loop

#### Compatibility with node-like callback APIs:
* use wrappers for node-style functions (Q.nfbind, Q.nbind)
* provide node-style API of your promised functions with Q.nodeify

#### Pitfalls
* promise not returned -> chain is broken
* error not rethrown -> chain is recovererd but should not be
* every then()/catch() handler is executed in an own event loop turn

#### Lessons learned
* catch() much easier to read than second function in then() for error handling
```
// avoid
getPromise()
.then(function fulfilled() {
  // be happy
}, function rejected() {
  // be sad
})

// recommended
getPromise()
.then(function fulfilled() {
  // be happy
})
.catch(function rejected() {
  // be sad
})
```

* return promise or call done() if promise chain not returned - always.
  * otherwise possible execptions are never noticed (especially ones that could be thrown in a catch-handler)
  * done() throws that exception in the next loop turn -> could be at least logged etc.
```
// avoid
function brokenInCatch() {
   getPromise()                     // attention: promise is not returned to the caller of brokenInCatch()
   .then(function fulfilled() {})
   .catch(function rejected() {
      throw new Error('oops')       // never noticed
   })
}

// recommanded
function brokenInCatch() {
   getPromise()
   .then(function fulfilled() {})
   .catch(function rejected() {
      throw new Error('oops')
   })
   .done()    // exceptions that are not yet handled/caugth are thrown in the next loop turn -> can be logged
}
```

* fin() handy to clean ressources
   * values of resolved/rejected promise before fin() are propagated
   * if fin() causes an exception -> promise is rejected with that exception
```
// avoid
function usesTempResources() {
    return Q.fcall(function createTempResources() {
      // make tmp dir
    })
    .then(heavyLifting)
    .then(function fulfilled() {
      cleanup()
    })
    .catch(function rejected(error) {
      cleanup()
      throw error         // we want to propagate the error to the caller of usesTempResources()
    })
    
    function cleanup() {
    }
}

// recommanded
function usesTempResources() {
    return Q.fcall(function createTempResources() {
      // make tmp dir
    })
    .then(heavyLifting)
    .fin(cleanup)         // always executed; value of rejected/resolved promise before fin() is propagated
    
    function cleanup() {
    }
}
```
* loops over arrays triggering asynchronous functions for each item might make you thinking about recursion -> there is a better way with map/reduce: http://taoofcode.net/promise-anti-patterns/ (The Collection Kerfuffle)
* escape chain on conditions -> use nesting and return early with Q.when()
```
function getFormattedData(input) {
  return Q.fcall(function init() {
    if(input < 0) {
      return Q.when('precomputed data')   // return early -> continue with formatData() below
    }
    
    return heavyComputation(input)
    .then(otherHeavyStuff)
    .then(furtherCpuBursting)
  })
  .then(formatData)
}
```
* put long stack traces on for debugging: 
```
Q.longStackSupport = true
```

#### Dive deeper: Why do promises feel that good?
* Promises are (at least close to) a monad, more exactly the continuation monad. Correctly used, monads and functional programming in general help to master complexity. Read more about:
   * http://brianmckenna.org/blog/category_theory_promisesaplus
   * https://curiosity-driven.org/monads-in-javascript#continuation

#### Ressources
* highly recommended: https://spion.github.io/posts/why-i-am-switching-to-promises.html
  * useful snippets: http://promise-nuggets.github.io/
* API: https://github.com/kriskowal/q/wiki/API-Reference
* https://www.promisejs.org/
* https://github.com/bellbind/using-promise-q/
* https://strongloop.com/strongblog/promises-in-node-js-with-q-an-alternative-to-callbacks/
* 

#### Other retrospects
* https://medium.com/@killercup/using-promises-more-effectively-in-node-js-461387397aa3#.3hmgzhxol

#### Alternative promise implementations
* Bluebird: https://github.com/petkaantonov/bluebird

### Examples

Install:
```
sudo npm i mocha -g
sudo npm i run -g
cd ~/promise-examples/ && npm i
```

Start examples 1 to 6 with live reload:
```
DEBUG=* runjs src/script.js
```

Start test example 7 with mocha in wathing mode
```
mocha -w --recursive src/7-0_timestampEstimation.test.js
```

#### Ausgangslage:
* Abfolge von I/O, wenn etwas fehlschlägt, alle anderen Aufgaben skippen

#### plain.js:
* "Pyramid of Doom": https://github.com/kriskowal/q
  * kann mühsam werden mit Conditions
* keine Kontrolle über Exceptions in den Callbacks
  * Exception wird zwar geworfen, man kann sie jedoch nicht generell und bequem fangen
  * try-catch in jedem Callback möglich -> noch fehleranfälligerer Code
  * trycatch npm module existiert (https://www.npmjs.com/package/trycatch): trotzdem können errors von async functions und exceptions von synchronen Funktionsaufrufen nicht einheitlich behandelt werden

#### async-waterfall:
* keine Pyramide
** result data von async functions nicht lokal gehalten (kann schnell unübersichtlich werden)
* exception and try-catch Problem bleibt bestehen
  * library trycatch -> keine wesentliche Vereinfachung

#### promises-serial
* Error von async Callbacks UND Excpetions können zentral bearbeitet werden !!! -> Schlüsselpunkt für stabileren und wartbaren Code
* Q.nbind() to convert node-style callback -> Promise
* Kette von Promises
  * am Ende jedes Callbacks kann ein weiteres Promise in die Kette geschoben werden
  * Conditions lassen sich einfach einbauen
* Error fliesst bis zum nächsten catch
  * feingranulare Behandlung von Errors möglich -> Error recovery
  * Wichtig: Kette von Promises darf nicht unterbrochen werden (return vergessen)
* keine Pyramide
  * Variablen nicht lokal gehalten
  * per Nesting können Variablen lokaler gehalten werden -> aber Pyramide baut sich auf

#### promises-concurrent
* Error-Handling: Q.all() liefert rejected Promise wenn mongo ODER postgres fehlschlägt
  * wenn alle async Funktionsaufrufe einzeln gecheckt werden wollen: Q.allSettled()
* promise array für Q.all() kann dynamisch aufgebaut werden
* wenn promise array statisch: spread() als syntactic sugar
* einfache Fakes können mit Q.when() eingeschleust werden

#### promises-fin
* Vereinfachung mit fin für cleanup-Aufgaben
* fin() gibt Promise zurück, welche vor dem fin()-Call schon in der Kette war (egal ob diese rejected oder fulfilled war)
* wenn exception in fin()-Handler geworfen wird -> fin() gibt rejected Promise mit jenem Error-Objekt zurück (Inhalt der ursprünglichen Promise vor fin() geht "verloren")

#### promises-done
* Funktiono sollte IMMER entweder Promise zurück geben oder die Promise-Kette mit done() abschliessen
  * done() bringt allfällig verborgene, noch nicht behandelte Exceptions ans Tageslicht. Bsp: catch()-Handler wirft Exception und es folgt kein weiterer catch()-Handler mehr danach -> ohne done() bleibt jene Exception verborgen

#### provide node-compatible API
* use Q.nodeify() to provide node-like callback API

#### Test function that returns promise
* return promise to mocha -> test runner waits for that promise until it is rejected or fulfilled

#### Test function with promises inside not returning a promise
* work around: use additional callback only for testing and use done from mocha
  * done(onFulfill, onError) -> attention: onResolved callback has resolved value as arg1, onRejected callback has error object as arg1
