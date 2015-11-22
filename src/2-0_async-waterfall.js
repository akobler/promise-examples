
// 3rd party
var async = require('async')
var debugPublish = require('debug')('publish')
// own
var api = require('./0-0_api.js')


/**********************
* Orchestration
**********************/
publish(function(error, result) {
    if(error) {
        return debugPublish('PUBLISH FAILED', error)
    }

    debugPublish('PUBLISH SUCCESS: ', result)
})

function publish(publishDone) {
    var mongoData = ''
    var postgresData = ''

    async.waterfall([
        function mongo(callback) {
            // ASYNC
            api.readFromMongo(function(error, _mongoData) {
                if(error) {
                    return callback(error)
                }

                // throw new Error('ugly')         // won't be handled by 'PUBLISH FAILED'
                mongoData = _mongoData
                return callback()
            })
        },
        function postgres(callback) {
            // ASYNC
            api.readFromPostgres(function(error, _postgresData) {
                if(error) {
                    return callback(error)
                }

                postgresData = _postgresData
                return callback()
            })
        },
        function combine(callback) {
            // SYNC
            var film = {
                transcription: mongoData,
                speaker: postgresData
            }
            return callback(null, film)
        },
        function hugeProcess(film, callback) {
            // ASYNC
            return api.triggerHugeProcess({}, callback)
        },
    ], 

    function(error, result) {

        if(error) {
            return publishDone(error)
        }
        // throw new Error('ugly2')         // won't be handled by 'PUBLISH FAILED'
        publishDone(null, result)
    })   
}