
// 3rd party
var Q = require('q')

/**********************
* Interface
**********************/
exports.triggerHugeProcess = triggerHugeProcess

/**********************
* Debug
**********************/
// use API call with promise
triggerHugeProcess('hi')
.then(function(result) {
    console.log(result)
})
.catch(function(error) {
    console.log(error)
})

// use same API call with node-style callback interface
triggerHugeProcess('hi', function(error, result) {
    if(error) {
        return console.log(error)
    }
    console.log(result)
})

/**********************
* Implementation
**********************/
function triggerHugeProcess(data, callback) {

    return Q.delay(0)
    .then(function timeoutDone() {
        // throw new Error('ugly')
        console.log('huge process running on: ', data)
        return 'OK'
    })
    .nodeify(callback)
}