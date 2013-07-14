(function() {
  var document, file, fs, jsdom, parser, renderHaml, renderJST, runFile, _ref;

  fs = require('fs');

  jsdom = require("jsdom").jsdom;

  parser = require('./haml-jr').parser;

  _ref = require('./renderer'), renderJST = _ref.renderJST, renderHaml = _ref.renderHaml;

  global.Runtime = require('./runtime').Runtime;

  file = process.argv[2];

  document = jsdom();

  runFile = function(name) {
    var ast, data, fn, fragment, output, program;
    data = fs.readFileSync(name, "UTF-8");
    ast = parser.parse(data);
    program = renderJST(ast, {
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
