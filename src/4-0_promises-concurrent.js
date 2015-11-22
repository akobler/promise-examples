
// 3rd party
var Q = require('q')
var debugPublish = require('debug')('publish')
// own
var api = require('./0-0_api.js')

/**********************
* Orchestration
**********************/

// 1) serial IO
// |mongo ------------------|
//                           |postgres-------------------|
//                                                        |hugeProcess ------|
//
// 2) concurrent IO
// -> node mindset: everything runs in parallel except your code
// |mongo ------------------|
//  |postgres-------------------|
//                               |hugeProcess ------|

publish()
.then(function(result) {
    debugPublish('PUBLISH SUCCESS: ', result)
})
.catch(function(error) {
    debugPublish('PUBLISH FAILED', error)
})

function publish()
{
    var mongoP = Q.nbind(api.readFromMongo, api)()         // ASYNC
    var postgresP = Q.nbind(api.readFromPostgres, api)()   // ASYNC
    // easy to fake while debugging: to avoid an API call just assign a Q.when({myProperty: 'myData'})

    return Q.all([mongoP, postgresP])
    .spread(function readDone(mongoData, postgresData) {    // spread is syntactical sugar for then(function(resultsInArray) {})

        // throw new Error('ugly')
        var film = {
            transcription: mongoData,
            speaker: postgresData
        }

        return Q.nbind(api.triggerHugeProcess, api)(film) // ASYNC
    })
}
