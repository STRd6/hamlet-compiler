(function() {
  var HAMLjr, compile, fs, parser, runFile, sampleDir, samples, testFile, _ref;

  fs = require('fs');

  _ref = HAMLjr = require('./haml-jr'), parser = _ref.parser, compile = _ref.compile;

  sampleDir = "test/samples/haml";

  testFile = process.argv[2];

  samples = {};

  fs.readdirSync(sampleDir).forEach(function(file) {
    var data;
    data = fs.readFileSync("" + sampleDir + "/" + file, "UTF-8");
    return samples[file] = data;
  });

  runFile = function(name) {
    var file, result, sample;
    sample = samples["" + name + ".haml"];
    result = parser.parse(sample);
    file = "results/" + name + ".json";
    fs.writeFile(file, JSON.stringify(result, null, 2));
    console.log("Writing to file: " + file);
    file = "results/" + name + ".js";
    fs.writeFile(file, compile(result, {
      name: name
    }));
    return console.log("Writing to file: " + file);
  };

  if (testFile) {
    runFile(testFile);
  } else {
    Object.keys(samples).forEach(function(sample) {
      var name;
      name = sample.split(".")[0];
      return runFile(name);
    });
  }

}).call(this);
