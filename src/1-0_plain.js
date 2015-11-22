
// 3rd party
var debugPublish = require('debug')('publish')
// own
var api = require('./0-0_api.js')

/**********************
* publish - plain
**********************/

publish(function(error, result) {
    if(error) {
        return debugPublish('PUBLISH FAILED', error)
    }

    debugPublish('PUBLISH SUCCESS: '+result)
})


function publish(publishDone) {
    return api.readFromMongo(function mongoDone(error, mongoData) {
        if(error) {
            return publishDone(error)
        }

        return api.readFromPostgres(function postgresDone(error, postgresData) {

                if(error) {
                    return publishDone(error)
                }

                // throw new Error('ugly')      // won't be handled with 'PUBLISH FAILED' :-/

                var film = {
                    transcription: mongoData,
                    speaker: postgresData
                }

                return api.triggerHugeProcess(film, publishDone)
        })
    })
}