
// 3rd party
var Q = require('q')
var debugPublish = require('debug')('publish')
// own
var api = require('./0-0_api.js')

/**********************
* Orchestration
**********************/
publish()
.then(function(result) {
    debugPublish('PUBLISH SUCCESS: ', result)
})
.catch(function(error) {
    debugPublish('PUBLISH FAILED', error)
})

function publish()
{
    var mongoData = ''
    var postgresData = ''

    return Q.nbind(api.readFromMongo, api)()         // ASYNC: turn node-style async function to promisified function call
    .then(function mongoDone(_mongoData) {

        // throw new Error('ugly')          // will reject promise returned by this then() block -> caught by next catch()
        mongoData = _mongoData
        return Q.nbind(api.readFromPostgres, api)()  // ASYNC: turn node-style async function to promisified function call
    })
    .then(function postgresDone(_postgresData) {

        postgresData = _postgresData

        // no return value -> fullfilled promise without content is generated
    })
    .then(function combine() {
        
        var film = {
            transcription: mongoData,
            speaker: postgresData
        }

        return Q.nbind(api.triggerHugeProcess, api)(film) // ASYNC: turn node-style async function to promisified function call
    })
}
