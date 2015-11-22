
var debugApi = require('debug')('api')

/**********************
* Interface
**********************/
exports.readFromMongo = readFromMongo
exports.readFromPostgres = readFromPostgres
exports.triggerHugeProcess = triggerHugeProcess

/**********************
* Implementation
**********************/
function readFromMongo(readDone) {

    setTimeout(function() {
        debugApi('reading from mongo') 
        // return readDone('mongoError')
        return readDone(null, 'hello Bern')
    }, 0)
}

function readFromPostgres(readDone) {

    setTimeout(function() {
        debugApi('reading from postgres')
        // return readDone('postgresError')
        return readDone(null, 'Andi')
    }, 0)
}

function triggerHugeProcess(data, hugeProcessDone) {

    setTimeout(function() {
        debugApi('huge process running on: ', data)
        // return hugeProcessDone('hugeProcessError')
        return hugeProcessDone(null, 'OK')
    }, 0)
}