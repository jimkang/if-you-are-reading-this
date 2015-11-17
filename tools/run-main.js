var tracery = require('tracery-grammar');
var jsonfile = require('jsonfile');

var grammarSpec = jsonfile.readFileSync(__dirname + '/../data/cbdq.json');
var processedGrammar = tracery.createGrammar(grammarSpec);

for (var i = 0; i < 10; ++i) {
  console.log(processedGrammar.flatten('#origin#'));
  console.log('\n');
}
