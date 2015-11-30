var tracery = require('tracery-grammar');
var jsonfile = require('jsonfile');

var root = 'origin';
var n = 100;

if (process.argv.length > 3) {
  n = process.argv[3];
}

if (process.argv.length > 2) {
  root = process.argv[2];
}

var grammarSpec = jsonfile.readFileSync(__dirname + '/../data/cbdq.json');
var processedGrammar = tracery.createGrammar(grammarSpec);

var validTweetCount = 0;

for (var i = 0; i < n; ++i) {
  var resolved = processedGrammar.flatten('#' + root + '#');
  console.log(resolved);
  console.log('\n');
  console.log('Length:', resolved.length);
  if (resolved.length < 141) {
    validTweetCount += 1;
  }
}

console.log('validTweetCount', validTweetCount);
