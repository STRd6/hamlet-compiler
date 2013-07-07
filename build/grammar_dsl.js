(function() {
  var Parser, node, unwrap;

  Parser = require('jison').Parser;

  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

  node = function(patternString, action, options) {
    var match, patternCount;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) {
      return [patternString, '$$ = $1;', options];
    }
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    patternCount = patternString.split(' ').length;
    return [patternString, "$$ = " + action + ";", options];
  };

  module.exports = {
    node: node,
    create: function(_arg) {
      var alt, alternatives, grammar, name, operators, startSymbol, token, tokens;
      grammar = _arg.grammar, operators = _arg.operators, startSymbol = _arg.startSymbol;
      if (startSymbol == null) {
        startSymbol = "root";
      }
      tokens = [];
      for (name in grammar) {
        alternatives = grammar[name];
        grammar[name] = (function() {
          var _i, _j, _len, _len1, _ref, _results;
          _results = [];
          for (_i = 0, _len = alternatives.length; _i < _len; _i++) {
            alt = alternatives[_i];
            _ref = alt[0].split(' ');
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              token = _ref[_j];
              if (!grammar[token]) {
                tokens.push(token);
              }
            }
            if (name === startSymbol) {
              alt[1] = "return " + alt[1];
            }
            _results.push(alt);
          }
          return _results;
        })();
      }
      return new Parser({
        tokens: tokens.join(' '),
        bnf: grammar,
        operators: operators.reverse(),
        startSymbol: startSymbol
      });
    }
  };

}).call(this);
