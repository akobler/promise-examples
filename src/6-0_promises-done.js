
// 3rd party
var Q = require('q')

/**********************
* fake response
**********************/
var response = {
    status: function(code) {
        return {
            send: function(data) {
                console.log('HTTP '+code+': '+data)
            }
        }
    }
}

/**********************
* Express REST handler
**********************/

calculateRestHandler({}, response)

// called from Express framework
function calculateRestHandler(req, res) {

    calculate()
    .then(function(result) {
        throw new Error('isCaugth')    // triggers the catch() handler below
        res.status(200).send(result)
    })
    .catch(function(error) {
        console.log(error)
        throw new Error('oops')        // this error would not be noticed directly without the done() at the end of the promise chain
        res.status(500).send('internal chaos')
    })
    .done()
}

function calculate()
{
    return Q.when('timestamps')
}



