var tracery = require('tracery-grammar');
var jsonfile = require('jsonfile');

var grammarSpec = jsonfile.readFileSync(__dirname + '/../data/cbdq.json');
var processedGrammar = tracery.createGrammar(grammarSpec);

var validTweetCount = 0;

for (var i = 0; i < 100; ++i) {
  var resolved = processedGrammar.flatten('#origin#');
  console.log(resolved);
  console.log('\n');
  console.log('Length:', resolved.length);
  if (resolved.length < 141) {
    validTweetCount += 1;
  }
}

console.log('validTweetCount', validTweetCount);
