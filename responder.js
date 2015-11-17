var config = require('./config/config');
var callNextTick = require('call-next-tick');
var Twit = require('twit');
var betterKnowATweet = require('better-know-a-tweet');
var async = require('async');
var createChronicler = require('basicset-chronicler').createChronicler;
var behavior = require('./behavior');
var emojisource = require('emojisource');

var dryRun = false;
if (process.argv.length > 2) {
  dryRun = (process.argv[2].toLowerCase() == '--dry');
}

var username = 'ngram_seance';

var chronicler = createChronicler({
  dbLocation: __dirname + '/data/seance-chronicler.db'
});

var twit = new Twit(config.twitter);
var streamOpts = {
  replies: 'all'
};
var stream = twit.stream('user', streamOpts);

stream.on('tweet', respondToTweet);

function respondToTweet(tweet) {
  debugger;
  if (tweet.user.screen_name === username) {
    return;
  }

  var usernames = betterKnowATweet.whosInTheTweet(tweet);
  if (!usernames || usernames.indexOf(username) === -1) {
    return;
  }

  async.waterfall(
    [
      goFindLastReplyDate,
      replyDateWasNotTooRecent,
      composeReply,
      postTweet,
      recordThatReplyHappened
    ],
    wrapUp
  );

  function goFindLastReplyDate(done) {
    debugger;
    findLastReplyDateForUser(tweet, done);
  }
}

function findLastReplyDateForUser(tweet, done) {
  debugger;
  chronicler.whenWasUserLastRepliedTo(
    tweet.user.id.toString(), passLastReplyDate
  );

  function passLastReplyDate(error, date) {
    debugger;
    // Don't pass on the error – `whenWasUserLastRepliedTo` can't find a
    // key, it returns a NotFoundError. For us, that's expected.
    if (error && error.type === 'NotFoundError') {
      error = null;
      date = new Date(0);
    }
    done(error, tweet, date);
  }
}

function replyDateWasNotTooRecent(tweet, date, done) {
  debugger;
  if (typeof date !== 'object') {
    date = new Date(date);
  }
  var hoursElapsed = (Date.now() - date.getTime()) / (60 * 60 * 1000);

  if (hoursElapsed > behavior.hoursToWaitBetweenRepliesToSameUser) {
    done(null, tweet);
  }
  else {
    done(new Error(
      `Replied ${hoursElapsed} hours ago to ${tweet.user.screen_name}.
      Need at least ${behavior.hoursToWaitBetweenRepliesToSameUser} to pass.`
    ));
  }
}

function composeReply(tweet, done) {
  var text = '@' + tweet.user.screen_name + ' I am replying! ' +
    emojisource.getRandomTopicEmoji();
  callNextTick(done, null, text);
}

function postTweet(text, done) {
  if (dryRun) {
    console.log('Would have tweeted:', text);
    var mockTweetData = {
      user: {
        id_str: 'mockuser',        
      }
    };
    callNextTick(done, null, mockTweetData);
  }
  else {
    var body = {
      status: text
    };
    twit.post('statuses/update', body, done);
  }
}

function recordThatReplyHappened(tweetData, response, done) {
  debugger;
  var userId = tweetData.user.id_str;
  // TODO: recordThatUserWasRepliedTo should be async.
  chronicler.recordThatUserWasRepliedTo(userId);
  callNextTick(done, null, tweetData);
}

function wrapUp(error, data) {
  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }
  }
}
