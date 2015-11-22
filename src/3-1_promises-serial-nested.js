
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
    return Q.nbind(api.readFromMongo, api)()         // ASYNC
    .then(function mongoDone(_mongoData) {
        
        return Q.nbind(api.readFromPostgres, api)()  // ASYNC
        .then(function postgresDone(_postgresData) {
            
            var film = {
                transcription: _mongoData,
                speaker: _postgresData
            }

            return Q.nbind(api.triggerHugeProcess, api)(film) // ASYNC
        })
    })
}
