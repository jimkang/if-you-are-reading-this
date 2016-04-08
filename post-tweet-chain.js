var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var async = require('async');
var probable = require('probable');
var tracery = require('tracery-grammar');
var jsonfile = require('jsonfile');

var grammarSpec = jsonfile.readFileSync(__dirname + '/data/cbdq.json');
var processedGrammar = tracery.createGrammar(grammarSpec);

var decorators = [
  "🔔",
  "🔊",
  "📢",
  "💣",
  "📡",
  "🛂",
  "⚡",
  "👏",
  "🚨",
  "⚠",
  "❗",
  "‼"
];

var resolvedParts;

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var twit = new Twit(config.twitter);

var statements = getStatements();
var resolvedText = statements.join(' ');
if (resolvedText.length < 100 && probable.roll(2) === 0) {
  postTweets([resolvedText, getRepeatText(), resolvedText], wrapUp);
}
else if (resolvedText.length <= 140) {
  postTweets([resolvedText], wrapUp);
}
else {
  postTweets(statements, wrapUp);
}

function getStatements() {
  var origin = probable.pickFromArray(grammarSpec.origin);
  var grammarKeys = origin.split(' ');
  // console.log('grammarKeys', grammarKeys);
  var parts = grammarKeys.map(getStatement);

  if (probable.roll(3) === 0) {
    var decorateIndex = probable.roll(parts.length);
    parts[decorateIndex] = decorate(parts[decorateIndex]);
  }

  return parts.map(randomlyCap);
}

function getStatement(part) {
  return processedGrammar.flatten(part);
}

function decorate(part) {
  var decorator = probable.pickFromArray(decorators);
  return decorator + ' ' + part + ' ' + decorator;
}

function addPeriod(s) {
  return s + '.';
}

function randomlyCap(s) {
  if (probable.roll(5) === 0) {
    return s.toUpperCase();
  }
  else {
    return s;
  }
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
      nextCallback = callPostNextTweet;
    }

    twit.post('statuses/update', body, nextCallback);

    // This function saves the context, `parts` in particular.
    function callPostNextTweet(error, lastTweet) {
      if (error) {
        callNextTick(done, error);
      }
      else {
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

function getRepeatText() {
  var text = 'REPEAT';
  var bookend = '';

  if (probable.roll(2) === 0) {
    var decorator = probable.pickFromArray(decorators);
    for (var i = 0; i < probable.rollDie(7); ++i)  {
      bookend += decorator;
    }
  }

  if (bookend.length > 0) {
    text = bookend + ' ' + text + ' ' + bookend;
  }

  return '\n' + text + '\n';
}
