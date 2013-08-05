(function() {
  var HAMLjr, compile, document, file, fs, jsdom, parser, runFile, _ref;

  fs = require('fs');

  jsdom = require("jsdom").jsdom;

  _ref = HAMLjr = require('./haml-jr'), parser = _ref.parser, compile = _ref.compile;

  file = process.argv[2];

  document = jsdom();

  runFile = function(name) {
    var ast, data, fn, fragment, output, program;
    data = fs.readFileSync(name, "UTF-8");
    ast = parser.parse(data);
    program = compile(ast, {
      explicitScripts: true
    });
    fn = eval(program);
    fragment = fn();
    output = Array.prototype.map.call(fragment.childNodes, function(node) {
      return node.outerHTML;
    }).join("\n");
    return process.stdout.write(output);
  };

  runFile(file);

}).call(this);
