
// 3rd party
var Q = require('q')
var debugPublish = require('debug')('publish')

/**********************
* Orchestration
**********************/
calculate()
.then(function(result) {
    debugPublish('CALCULATION SUCCESS: ', result)
})
.catch(function(error) {
    debugPublish('CALCULATION FAILED', error)
})

function calculate()
{
    var tmpFile = '/tmp/bigFile.mp4'

    return Q.fcall(function() {
        // create tmpFile

        // throw new Error('calculation failed')
        return 5
    })
    // promise in chain before fin() stays in the chain after the fin() -> in both cases, fulfilled and rejected
    .fin(removeFile)
    // if fin()-handler throws exception: fin() returns rejected promise with thrown error (already rejected promise before fin() would be replaced)

    function removeFile() {
        // remove tmpFile

        // throw new Error('unforseen')
        debugPublish('FILE REMOVED')
    }
}
