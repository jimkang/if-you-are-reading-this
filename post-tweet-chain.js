var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var probable = require('probable');
var tracery = require('tracery-grammar');
var jsonfile = require('jsonfile');

var grammarSpec = jsonfile.readFileSync(__dirname + '/data/cbdq.json');
var processedGrammar = tracery.createGrammar(grammarSpec);

var statementParts = [
  'condition',
  'prediction',
  'direction'
];

var resolvedParts;

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);

async.waterfall(
  [
    getStatements,
    postTweets
  ],
  wrapUp
);

function getStatements(done) {
  var parts = statementParts.map(getStatement);
  parts[0] = formatCondition(parts[0]);
  callNextTick(done, null, parts.map(addPeriod));
}

function getStatement(part) {
  return processedGrammar.flatten('#' + part + '#');
}

function formatCondition(condition) {
  return 'If you are reading this, ' + condition;
}

function addPeriod(s) {
  return s + '.';
}

function postTweets(parts, done) {
  if (dryRun) {
    var combinedStatement = parts.join(' ');
    console.log('Would have tweeted:', combinedStatement);
    callNextTick(done);
  }
  else {
    postNextTweet(null, done);
  }

  function postNextTweet(lastTweet, done) {
    var text = '';
    debugger;
    if (parts.length < 1) {
      callNextTick(done);
    }
    else if (lastTweet) {
      text += '> ';
    }

    while (parts.length > 0) {
      if (text.length + parts[0].length + 1 < 141) {
        if (text.length > 0) {
          text += ' ';
        }
        text += parts[0];
        parts.shift();
      }
      else {
        break;
      }
    }

    var body = {
      status: text
    };

    if (lastTweet) {
      body.in_reply_to_status_id = lastTweet.id_str;
    }

    var nextCallback = done;
    if (parts.length > 0) {
      debugger;
      nextCallback = callPostNextTweet;
    }

    debugger;
    twit.post('statuses/update', body, nextCallback);

    // This function saves the context, `parts` in particular.
    function callPostNextTweet(error, lastTweet) {
      if (error) {
        callNextTick(done, error);
      }
      else {
        debugger;
        postNextTweet(lastTweet, done);
      }
    }
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
