var config = require('./config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);
// var wordnok = createWordnok({
//   apiKey: config.wordnikAPIKey,
//   logger: {
//     log: function noOp() {}
//   }
// });

async.waterfall(
  [
    // kickOffFunction,
    // theNextThing,
    // theNextThingAfterThat,
    postTweet
  ],
  wrapUp
);

function postTweet(text, done) {
  if (dryRun) {
    console.log('Would have tweeted:', text);
    callNextTick(done);
  }
  else {
    var body = {
      status: text
    };
    twit.post('statuses/update', body, done);
  }
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
}
