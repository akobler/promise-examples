
// 3rd party
var Q = require('q')

/**********************
* Interface
**********************/
exports.calculate_REST = calculate_REST
exports.calculate = calculate

/**********************
* Implementation
**********************/

// called from Express framework
function calculate_REST(req, res, callback_forTesting) {

    return Q.fcall(function extractParameters() {

        var first = parseInt(req.params.first)
        var second = parseInt(req.params.second)
        if(isNaN(first) || isNaN(second)) {
            return res.status(400).send('bad input')
        }
        // throw new Error('err')       // caught by catch(), callback_forTesting is called without parameter
        return calculate(first, second)
        .then(function(result) {
            return res.status(200).send(result)
        })
    })
    .catch(function(error) {
        // throw new Error('err')       // callback_forTesting is called with error object
        return res.status(500).send('internal chaos')
    })
    // cancel parameter in resolve-case, forward error parameter
    .done(callback_forTesting.bind(null, null), callback_forTesting)
}

function calculate(first, second)
{
    return Q.delay(200)
    .then(function() {
        // throw new Error('ugly')
        return first*second
    })
}
