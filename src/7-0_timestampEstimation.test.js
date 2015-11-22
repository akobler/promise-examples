
// 3rd party
var assert = require('chai').assert

// own
var timestampEstimation = require('./7-0_timestampEstimation.js')

describe('timestampEstimation', function() {

    // how to test a function that returns a promise
    describe.only('#calculate', function() {
        it.only('shoulde return calculated result', function() {

            // action
            return timestampEstimation.calculate(6, 5)      // return promise to mocha test runner -> test runner waits until returned promise is fulfilled/rejected
            .then(function(result) {

                // verify
                assert.equal(result, 30)
                // assert.isTrue(false)        // oops: force test to fail -> test would not fail if promise were not returned to test runner
            })
        })
    })

    // work around to test a asynchronous function whose promise chain is completed with a done()
    describe('#calculate_REST', function() {

        var res = {}
        beforeEach(function() {
            // fake response
            res = {
                state: 0,
                data: '',
                send: function(data){
                    this.data = data 
                    return this
                },
                status: function(state) {
                    this.state = state
                    return this
                }
            }
        })

        it('should save calculated result in res', function(done) {

            // prepare
            var req = {
                params: {
                    first: 6,
                    second: 5
                }
            }

            // action
            timestampEstimation.calculate_REST(req, res, function(error) {
                
                // verify
                assert.equal(res.state, 200)
                assert.equal(res.data, 30)
                done(error)                     // use done() from mocha to complete async test -> calculate_REST() does not return a promise
            })
        })
    })


})

