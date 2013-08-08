;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var Gistquire, HAMLjr, auth, compile, load, parser, postData, rerender, save, styl, update, util, _ref;

  _ref = HAMLjr = require('./haml-jr'), parser = _ref.parser, compile = _ref.compile, util = _ref.util;

  Gistquire = require('./gistquire');

  styl = require('styl');

  window.HAMLjr = HAMLjr;

  window.Observable = require('tempest-js').Observable;

  window.r = require;

  window.parser = parser;

  rerender = (function() {
    var ast, coffee, data, error, fragment, haml, selector, style, template, _ref1;
    if (location.search.match("embed")) {
      selector = "body";
    } else {
      selector = "#preview";
    }
    if (!$("#template").length) {
      return;
    }
    _ref1 = editors.map(function(editor) {
      return editor.getValue();
    }), coffee = _ref1[0], haml = _ref1[1], style = _ref1[2];
    try {
      data = Function("return " + CoffeeScript.compile("do ->\n" + util.indent(coffee), {
        bare: true
      }))();
      $("#errors p").eq(0).empty();
    } catch (_error) {
      error = _error;
      $("#errors p").eq(0).text(error);
    }
    try {
      ast = parser.parse(haml + "\n");
      template = Function("return " + compile(ast, {
        compiler: CoffeeScript
      }))();
      $("#errors p").eq(1).empty();
      $("#debug code").eq(1).text(template);
    } catch (_error) {
      error = _error;
      $("#errors p").eq(1).text(error);
    }
    try {
      style = styl(style, {
        whitespace: true
      }).toString();
      $("#errors p").eq(2).empty();
    } catch (_error) {
      error = _error;
      $("#errors p").eq(2).text(error);
    }
    if ((template != null) && (data != null)) {
      try {
        fragment = template(data);
        return $(selector).empty().append(fragment).append("<style>" + style + "</style>");
      } catch (_error) {
        error = _error;
        return $("#errors p").eq(1).text(error);
      }
    }
  }).debounce(100);

  postData = function() {
    var data, style, template, _ref1;
    _ref1 = editors.map(function(editor) {
      return editor.getValue();
    }), data = _ref1[0], template = _ref1[1], style = _ref1[2];
    return JSON.stringify({
      "public": true,
      files: {
        data: {
          content: data
        },
        template: {
          content: template
        },
        style: {
          content: style
        }
      }
    });
  };

  save = function() {
    return Gistquire.create(postData(), function(data) {
      return location.hash = data.id;
    });
  };

  auth = function() {
    var url;
    url = 'https://github.com/login/oauth/authorize?client_id=bc46af967c926ba4ff87&scope=gist,user:email';
    return window.location = url;
  };

  load = function(id) {
    return Gistquire.get(id, function(data) {
      ["data", "template", "style"].each(function(file, i) {
        var content, editor, _ref1;
        content = ((_ref1 = data.files[file]) != null ? _ref1.content : void 0) || "";
        editor = editors[i];
        editor.setValue(content);
        editor.moveCursorTo(0, 0);
        return editor.session.selection.clearSelection();
      });
      return rerender();
    });
  };

  update = function() {
    var id, _ref1;
    if (id = (_ref1 = location.hash) != null ? _ref1.substring(1) : void 0) {
      return Gistquire.update(id, postData(), function(data) {});
    }
  };

  $(function() {
    var code, id, _ref1, _ref2;
    window.editors = [["data", "coffee"], ["template", "haml"], ["style", "stylus"]].map(function(_arg) {
      var editor, id, mode;
      id = _arg[0], mode = _arg[1];
      editor = ace.edit(id);
      editor.setTheme("ace/theme/tomorrow");
      editor.getSession().setMode("ace/mode/" + mode);
      editor.getSession().on('change', rerender);
      editor.getSession().setUseSoftTabs(true);
      editor.getSession().setTabSize(2);
      return editor;
    });
    if (code = (_ref1 = window.location.href.match(/\?code=(.*)/)) != null ? _ref1[1] : void 0) {
      $.getJSON('https://hamljr-auth.herokuapp.com/authenticate/#{code}', function(data) {
        var token;
        if (token = data.token) {
          Gistquire.authToken = token;
          return localStorage.authToken = token;
        }
      });
    }
    if (id = (_ref2 = location.hash) != null ? _ref2.substring(1) : void 0) {
      load(id);
    } else {
      rerender();
    }
    if (localStorage.authToken) {
      Gistquire.accessToken = localStorage.authToken;
    }
    $("#actions .save").on("click", save);
    $("#actions .auth").on("click", auth);
    return $("#actions .update").on("click", update);
  });

}).call(this);

},{"./gistquire":3,"./haml-jr":4,"styl":15,"tempest-js":60}],2:[function(require,module,exports){
(function(process){(function() {
  var CoffeeScript, indentText, keywords, keywordsRegex, styl, util,
    __slice = [].slice;

  CoffeeScript = require("coffee-script");

  styl = require('styl');

  indentText = function(text, indent) {
    if (indent == null) {
      indent = "  ";
    }
    return indent + text.replace(/\n/g, "\n" + indent);
  };

  keywords = ["on", "each", "with", "render"];

  keywordsRegex = RegExp("\\s*(" + (keywords.join('|')) + ")\\s+");

  util = {
    indent: indentText,
    filters: {
      styl: function(content, compiler) {
        return compiler.styleTag(styl(content, {
          whitespace: true
        }).toString());
      },
      verbatim: function(content, compiler) {
        return compiler.buffer('"""' + content.replace(/(#)/, "\\$1") + '"""');
      },
      plain: function(content, compiler) {
        return compiler.buffer(JSON.stringify(content));
      },
      coffeescript: function(content, compiler) {
        if (compiler.explicitScripts) {
          return [compiler.scriptTag(CoffeeScript.compile(content))];
        } else {
          return [content];
        }
      },
      javascript: function(content, compiler) {
        if (compiler.explicitScripts) {
          return [compiler.scriptTag(content)];
        } else {
          return ["`", compiler.indent(content), "`"];
        }
      }
    },
    styleTag: function(content) {
      return this.element("style", [], ["__element.innerHTML = " + (JSON.stringify("\n" + this.indent(content)))]);
    },
    scriptTag: function(content) {
      return this.element("script", [], ["__element.innerHTML = " + (JSON.stringify("\n" + this.indent(content)))]);
    },
    element: function(tag, attributes, contents) {
      var attributeLines, lines;
      if (contents == null) {
        contents = [];
      }
      attributeLines = attributes.map(function(_arg) {
        var name, value;
        name = _arg.name, value = _arg.value;
        name = JSON.stringify(name);
        return "__attribute __element, " + name + ", " + value;
      });
      return lines = ["__element = document.createElement(" + (JSON.stringify(tag)) + ")", "__push(__element)"].concat(__slice.call(attributeLines), __slice.call(contents), ["__pop()"]);
    },
    buffer: function(value) {
      return ["__element = document.createTextNode('')", "__text(__element, " + value + ")", "__push __element", "__pop()"];
    },
    stringJoin: function(values) {
      var dynamic;
      dynamic = this.dynamic;
      values = values.map(function(value) {
        if (value.indexOf("\"") === 0) {
          return JSON.parse(value);
        } else {
          return dynamic(value);
        }
      });
      return JSON.stringify(values.join(" "));
    },
    dynamic: function(value) {
      return "\#{" + value + "}";
    },
    attributes: function(node) {
      var attributeId, attributes, classes, dynamic, id;
      dynamic = this.dynamic;
      id = node.id, classes = node.classes, attributes = node.attributes;
      classes = (classes || []).map(JSON.stringify);
      attributeId = void 0;
      if (attributes) {
        attributes = attributes.filter(function(_arg) {
          var name, value;
          name = _arg.name, value = _arg.value;
          if (name === "class") {
            classes.push(value);
            return false;
          } else if (name === "id") {
            attributeId = value;
            return false;
          } else {
            return true;
          }
        });
      } else {
        attributes = [];
      }
      if (classes.length) {
        attributes.unshift({
          name: "class",
          value: this.stringJoin(classes)
        });
      }
      if (attributeId) {
        attributes.unshift({
          name: "id",
          value: attributeId
        });
      } else if (id) {
        attributes.unshift({
          name: "id",
          value: JSON.stringify(id)
        });
      }
      return attributes;
    },
    render: function(node) {
      var filter, tag, text;
      tag = node.tag, filter = node.filter, text = node.text;
      if (tag) {
        return this.tag(node);
      } else if (filter) {
        return this.filter(node);
      } else {
        return this.contents(node);
      }
    },
    replaceKeywords: function(codeString) {
      return codeString.replace(keywordsRegex, "__$1 ");
    },
    filter: function(node) {
      return [].concat.apply([], this.filters[node.filter](node.content, this));
    },
    contents: function(node) {
      var bufferedCode, childContent, children, code, contents, indent, text, unbufferedCode;
      children = node.children, bufferedCode = node.bufferedCode, unbufferedCode = node.unbufferedCode, text = node.text;
      if (unbufferedCode) {
        indent = true;
        code = this.replaceKeywords(unbufferedCode);
        contents = [code];
      } else if (bufferedCode) {
        contents = this.buffer(bufferedCode);
      } else if (text) {
        contents = this.buffer(JSON.stringify(text));
      } else if (node.tag) {
        contents = [];
      } else if (node.comment) {
        return [];
      } else {
        contents = [];
        console.warn("No content for node:", node);
      }
      if (children) {
        childContent = this.renderNodes(children);
        if (indent) {
          childContent = this.indent(childContent.join("\n"));
        }
        contents = contents.concat(childContent);
      }
      return contents;
    },
    renderNodes: function(nodes) {
      return [].concat.apply([], nodes.map(this.render, this));
    },
    tag: function(node) {
      var attributes, contents, tag;
      tag = node.tag;
      attributes = this.attributes(node);
      contents = this.contents(node);
      return this.element(tag, attributes, contents);
    }
  };

  exports.util = util;

  exports.compile = function(parseTree, _arg) {
    var compiler, error, explicitScripts, items, name, options, program, programSource, source, _ref;
    _ref = _arg != null ? _arg : {}, explicitScripts = _ref.explicitScripts, name = _ref.name, compiler = _ref.compiler;
    if (compiler) {
      CoffeeScript = compiler;
    }
    util.explicitScripts = explicitScripts;
    items = util.renderNodes(parseTree);
    source = "(data) ->\n  (->\n    {\n      __push\n      __pop\n      __attribute\n      __text\n      __on\n      __each\n      __with\n      __render\n    } = HAMLjr.Runtime(this)\n\n    __push document.createDocumentFragment()\n" + (util.indent(items.join("\n"), "    ")) + "\n    __pop()\n  ).call(data)";
    if (name) {
      options = {};
      programSource = "@HAMLjr ||= {}\n@HAMLjr.templates ||= {}\n@HAMLjr.templates[" + (JSON.stringify(name)) + "] = " + source;
    } else {
      options = {
        bare: true
      };
      programSource = source;
    }
    try {
      program = CoffeeScript.compile(programSource, options);
      return program;
    } catch (_error) {
      error = _error;
      process.stderr.write("COMPILE ERROR:\n  SOURCE:\n " + programSource + "\n");
      throw error;
    }
  };

}).call(this);

})(require("__browserify_process"))
},{"__browserify_process":14,"coffee-script":8,"styl":15}],3:[function(require,module,exports){
(function() {
  module.exports = {
    accessToken: null,
    update: function(id, data, callback) {
      var url;
      url = "https://api.github.com/gists/" + id;
      if (this.accessToken) {
        url += "?access_token=" + this.accessToken;
      }
      return $.ajax({
        url: url,
        type: "PATCH",
        dataType: 'json',
        data: data,
        success: callback
      });
    },
    create: function(data, callback) {
      var url;
      url = "https://api.github.com/gists";
      if (this.accessToken) {
        url += "?access_token=" + this.accessToken;
      }
      return $.ajax({
        url: url,
        type: "POST",
        dataType: 'json',
        data: data,
        success: callback
      });
    },
    get: function(id, callback) {
      var data;
      if (this.accessToken) {
        data = {
          access_token: this.accessToken
        };
      } else {
        data = {};
      }
      return $.getJSON("https://api.github.com/gists/" + id, data, callback);
    },
    load: function(id, _arg) {
      var callback, file;
      file = _arg.file, callback = _arg.callback;
      if (file == null) {
        file = "build.js";
      }
      return this.get(id, function(data) {
        Function(data.files[file])();
        return callback();
      });
    }
  };

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var Runtime, compile, extend, lexer, oldParse, parser, util, _ref,
    __slice = [].slice;

  _ref = require("./compiler"), compile = _ref.compile, util = _ref.util;

  lexer = require("./lexer").lexer;

  parser = require("./parser").parser;

  Runtime = require("./runtime").Runtime;

  extend = function() {
    var name, source, sources, target, _i, _len;
    target = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (name in source) {
        target[name] = source[name];
      }
    }
    return target;
  };

  oldParse = parser.parse;

  extend(parser, {
    lexer: lexer,
    parse: function(input) {
      extend(parser.yy, {
        indent: 0,
        nodePath: [
          {
            children: []
          }
        ],
        filterIndent: void 0
      });
      return oldParse.call(parser, input);
    }
  });

  extend(parser.yy, {
    extend: extend,
    newline: function() {
      var lastNode;
      lastNode = this.nodePath[this.nodePath.length - 1];
      if (lastNode.filter) {
        return this.appendFilterContent(lastNode, "");
      }
    },
    append: function(node, indentation) {
      var index, lastNode, parent;
      if (indentation == null) {
        indentation = 0;
      }
      if (node.filterLine) {
        lastNode = this.nodePath[this.nodePath.length - 1];
        this.appendFilterContent(lastNode, node.filterLine);
        return;
      }
      parent = this.nodePath[indentation];
      this.appendChild(parent, node);
      index = indentation + 1;
      this.nodePath[index] = node;
      this.nodePath.length = index + 1;
      return node;
    },
    appendChild: function(parent, child) {
      if (!child.filter) {
        this.filterIndent = void 0;
        this.lexer.popState();
      }
      parent.children || (parent.children = []);
      return parent.children.push(child);
    },
    appendFilterContent: function(filter, content) {
      filter.content || (filter.content = "");
      return filter.content += "" + content + "\n";
    }
  });

  extend(exports, {
    compile: compile,
    parser: parser,
    Runtime: Runtime,
    util: util
  });

}).call(this);

},{"./compiler":2,"./lexer":5,"./parser":6,"./runtime":7}],5:[function(require,module,exports){
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"moduleName":"lexer"},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:this.popState(); return 'NEWLINE';
break;
case 1:yy_.yytext = yy_.yytext.trim(); return 'CODE';
break;
case 2:this.popState(); return 'NEWLINE';
break;
case 3:return 'TEXT';
break;
case 4:this.popState(); return 'RIGHT_BRACE';
break;
case 5:yy_.yytext = yy_.yytext.substring(1); return 'ATTRIBUTE';
break;
case 6:this.begin('brace_value'); return 'EQUAL';
break;
case 7:return 'SEPARATOR';
break;
case 8:return 'TEXT';
break;
case 9:this.popState(); return 'ATTRIBUTE_VALUE';
break;
case 10:this.popState(); return 'ATTRIBUTE_VALUE';
break;
case 11:return 'SEPARATOR';
break;
case 12:this.popState(); return 'RIGHT_PARENTHESIS';
break;
case 13:return 'ATTRIBUTE';
break;
case 14:this.begin('value'); return 'EQUAL';
break;
case 15:this.popState(); return 'ATTRIBUTE_VALUE';
break;
case 16:this.popState(); return 'ATTRIBUTE_VALUE';
break;
case 17:this.popState(); return 'ATTRIBUTE_VALUE';
break;
case 18:yy.indent = 0; this.popState(); return 'NEWLINE';
break;
case 19:return 'EOF';
break;
case 20:return 'FILTER_LINE';
break;
case 21:yy.indent = 0; return 'NEWLINE';
break;
case 22:return 'EOF';
break;
case 23:return 'DOCTYPE';
break;
case 24:yy.indent += 1; if(yy.indent > yy.filterIndent){this.begin('filter'); }; return 'INDENT';
break;
case 25:this.begin("parentheses_attributes"); return 'LEFT_PARENTHESIS';
break;
case 26:this.begin("brace_attributes"); return 'LEFT_BRACE';
break;
case 27:yy_.yytext = yy_.yytext.substring(1); return 'COMMENT';
break;
case 28:yy.filterIndent = yy.indent; yy_.yytext = yy_.yytext.substring(1); return 'FILTER';
break;
case 29:yy_.yytext = yy_.yytext.substring(1); return 'ID';
break;
case 30:yy_.yytext = yy_.yytext.substring(1); return 'CLASS';
break;
case 31:yy_.yytext = yy_.yytext.substring(1); return 'TAG';
break;
case 32:this.begin("code"); return 'EQUAL';
break;
case 33:this.begin("code"); return 'HYPHEN';
break;
case 34:return 'WHITESPACE';
break;
case 35:return 'TEXT';
break;
}
},
rules: [/^(?:\n)/,/^(?:.*)/,/^(?:\n)/,/^(?:.*)/,/^(?:\})/,/^(?::([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:[ \t]*=>[ \t])/,/^(?:,[ \t]*)/,/^(?:[^\}]*)/,/^(?:"(\\.|[^\\"])*")/,/^(?:[^ \t\}]*)/,/^(?:[ \t]+)/,/^(?:\))/,/^(?:([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:=)/,/^(?:"(\\.|[^\\"])*")/,/^(?:'(\\.|[^\\'])*')/,/^(?:[^ \t\)]*)/,/^(?:\n)/,/^(?:$)/,/^(?:[^\n]*)/,/^(?:\n)/,/^(?:$)/,/^(?:!!!)/,/^(?:  )/,/^(?:\()/,/^(?:\{)/,/^(?:\/.*)/,/^(?::([_a-zA-Z][-_a-zA-Z0-9]*))/,/^(?:#((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:\.((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:%((:|[A-Z]|_|[a-z])((:|[A-Z]|_|[a-z])|-|[0-9])*(?!-)))/,/^(?:=)/,/^(?:-)/,/^(?:[ \t]+)/,/^(?:.*)/],
conditions: {"filter":{"rules":[18,19,20],"inclusive":false},"value":{"rules":[15,16,17],"inclusive":false},"parentheses_attributes":{"rules":[11,12,13,14],"inclusive":false},"brace_value":{"rules":[9,10],"inclusive":false},"brace_attributes":{"rules":[4,5,6,7,8],"inclusive":false},"text":{"rules":[2,3],"inclusive":false},"code":{"rules":[0,1],"inclusive":false},"INITIAL":{"rules":[21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],"inclusive":true}}
};
return lexer;
})();exports.lexer = lexer;

},{}],6:[function(require,module,exports){
(function(process){/* parser generated by jison 0.4.9 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"lines":4,"line":5,"indentation":6,"indentationLevel":7,"INDENT":8,"DOCTYPE":9,"end":10,"lineMain":11,"tag":12,"rest":13,"COMMENT":14,"FILTER":15,"FILTER_LINE":16,"NEWLINE":17,"EOF":18,"name":19,"tagComponents":20,"attributes":21,"idComponent":22,"classComponents":23,"ID":24,"CLASS":25,"LEFT_PARENTHESIS":26,"attributePairs":27,"RIGHT_PARENTHESIS":28,"LEFT_BRACE":29,"RIGHT_BRACE":30,"SEPARATOR":31,"attributePair":32,"ATTRIBUTE":33,"EQUAL":34,"ATTRIBUTE_VALUE":35,"TAG":36,"CODE":37,"HYPHEN":38,"text":39,"beginText":40,"TEXT":41,"WHITESPACE":42,"$accept":0,"$end":1},
terminals_: {2:"error",8:"INDENT",9:"DOCTYPE",14:"COMMENT",15:"FILTER",16:"FILTER_LINE",17:"NEWLINE",18:"EOF",24:"ID",25:"CLASS",26:"LEFT_PARENTHESIS",28:"RIGHT_PARENTHESIS",29:"LEFT_BRACE",30:"RIGHT_BRACE",31:"SEPARATOR",33:"ATTRIBUTE",34:"EQUAL",35:"ATTRIBUTE_VALUE",36:"TAG",37:"CODE",38:"HYPHEN",41:"TEXT",42:"WHITESPACE"},
productions_: [0,[3,1],[4,2],[4,1],[6,0],[6,1],[7,2],[7,1],[5,2],[5,3],[5,1],[11,2],[11,1],[11,1],[11,1],[11,1],[11,1],[10,1],[10,1],[12,2],[12,2],[12,1],[12,1],[20,3],[20,2],[20,2],[20,2],[20,1],[20,1],[22,1],[23,2],[23,1],[21,3],[21,3],[27,3],[27,1],[32,3],[19,1],[13,2],[13,2],[13,1],[39,2],[39,1],[40,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = yy.nodePath[0].children;
break;
case 2:this.$ = $$[$0-1];
break;
case 3:this.$ = $$[$0];
break;
case 4:this.$ = 0;
break;
case 5:this.$ = $$[$0];
break;
case 6:this.$ = $$[$0-1] + 1;
break;
case 7:this.$ = 1;
break;
case 8:this.$ = "doctype";
break;
case 9:this.$ = yy.append($$[$0-1], $$[$0-2]);
break;
case 10:this.$ = (function () {
        if ($$[$0].newline) {
          return yy.newline();
        }
      }());
break;
case 11:this.$ = yy.extend($$[$0-1], $$[$0]);
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = {
          comment: $$[$0]
        };
break;
case 15:this.$ = {
          filter: $$[$0]
        };
break;
case 16:this.$ = {
          filterLine: $$[$0]
        };
break;
case 17:this.$ = {
          newline: true
        };
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = (function () {
        $$[$0].tag = $$[$0-1];
        return $$[$0];
      }());
break;
case 20:this.$ = {
          tag: $$[$0-1],
          attributes: $$[$0]
        };
break;
case 21:this.$ = {
          tag: $$[$0]
        };
break;
case 22:this.$ = yy.extend($$[$0], {
          tag: "div"
        });
break;
case 23:this.$ = {
          id: $$[$0-2],
          classes: $$[$0-1],
          attributes: $$[$0]
        };
break;
case 24:this.$ = {
          id: $$[$0-1],
          attributes: $$[$0]
        };
break;
case 25:this.$ = {
          classes: $$[$0-1],
          attributes: $$[$0]
        };
break;
case 26:this.$ = {
          id: $$[$0-1],
          classes: $$[$0]
        };
break;
case 27:this.$ = {
          id: $$[$0]
        };
break;
case 28:this.$ = {
          classes: $$[$0]
        };
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = $$[$0-1].concat($$[$0]);
break;
case 31:this.$ = [$$[$0]];
break;
case 32:this.$ = $$[$0-1];
break;
case 33:this.$ = $$[$0-1];
break;
case 34:this.$ = $$[$0-2].concat($$[$0]);
break;
case 35:this.$ = [$$[$0]];
break;
case 36:this.$ = {
          name: $$[$0-2],
          value: $$[$0]
        };
break;
case 37:this.$ = $$[$0];
break;
case 38:this.$ = {
          bufferedCode: $$[$0]
        };
break;
case 39:this.$ = {
          unbufferedCode: $$[$0]
        };
break;
case 40:this.$ = {
          text: $$[$0] + "\n"
        };
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = yy.lexer.begin('text');
break;
}
},
table: [{3:1,4:2,5:3,6:5,7:7,8:[1,10],9:[1,4],10:6,14:[2,4],15:[2,4],16:[2,4],17:[1,8],18:[1,9],24:[2,4],25:[2,4],34:[2,4],36:[2,4],38:[2,4],41:[2,4],42:[2,4]},{1:[3]},{1:[2,1],5:11,6:5,7:7,8:[1,10],9:[1,4],10:6,14:[2,4],15:[2,4],16:[2,4],17:[1,8],18:[1,9],24:[2,4],25:[2,4],34:[2,4],36:[2,4],38:[2,4],41:[2,4],42:[2,4]},{1:[2,3],8:[2,3],9:[2,3],14:[2,3],15:[2,3],16:[2,3],17:[2,3],18:[2,3],24:[2,3],25:[2,3],34:[2,3],36:[2,3],38:[2,3],41:[2,3],42:[2,3]},{10:12,17:[1,8],18:[1,9]},{11:13,12:14,13:15,14:[1,16],15:[1,17],16:[1,18],19:19,20:20,22:25,23:26,24:[1,29],25:[1,30],34:[1,21],36:[1,24],38:[1,22],39:23,40:27,41:[1,28],42:[1,31]},{1:[2,10],8:[2,10],9:[2,10],14:[2,10],15:[2,10],16:[2,10],17:[2,10],18:[2,10],24:[2,10],25:[2,10],34:[2,10],36:[2,10],38:[2,10],41:[2,10],42:[2,10]},{8:[1,32],14:[2,5],15:[2,5],16:[2,5],24:[2,5],25:[2,5],34:[2,5],36:[2,5],38:[2,5],41:[2,5],42:[2,5]},{1:[2,17],8:[2,17],9:[2,17],14:[2,17],15:[2,17],16:[2,17],17:[2,17],18:[2,17],24:[2,17],25:[2,17],34:[2,17],36:[2,17],38:[2,17],41:[2,17],42:[2,17]},{1:[2,18],8:[2,18],9:[2,18],14:[2,18],15:[2,18],16:[2,18],17:[2,18],18:[2,18],24:[2,18],25:[2,18],34:[2,18],36:[2,18],38:[2,18],41:[2,18],42:[2,18]},{8:[2,7],14:[2,7],15:[2,7],16:[2,7],24:[2,7],25:[2,7],34:[2,7],36:[2,7],38:[2,7],41:[2,7],42:[2,7]},{1:[2,2],8:[2,2],9:[2,2],14:[2,2],15:[2,2],16:[2,2],17:[2,2],18:[2,2],24:[2,2],25:[2,2],34:[2,2],36:[2,2],38:[2,2],41:[2,2],42:[2,2]},{1:[2,8],8:[2,8],9:[2,8],14:[2,8],15:[2,8],16:[2,8],17:[2,8],18:[2,8],24:[2,8],25:[2,8],34:[2,8],36:[2,8],38:[2,8],41:[2,8],42:[2,8]},{10:33,17:[1,8],18:[1,9]},{13:34,17:[2,12],18:[2,12],34:[1,21],38:[1,22],39:23,40:27,41:[1,28],42:[1,31]},{17:[2,13],18:[2,13]},{17:[2,14],18:[2,14]},{17:[2,15],18:[2,15]},{17:[2,16],18:[2,16]},{17:[2,21],18:[2,21],20:35,21:36,22:25,23:26,24:[1,29],25:[1,30],26:[1,37],29:[1,38],34:[2,21],38:[2,21],41:[2,21],42:[2,21]},{17:[2,22],18:[2,22],34:[2,22],38:[2,22],41:[2,22],42:[2,22]},{37:[1,39]},{37:[1,40]},{17:[2,40],18:[2,40]},{17:[2,37],18:[2,37],24:[2,37],25:[2,37],26:[2,37],29:[2,37],34:[2,37],38:[2,37],41:[2,37],42:[2,37]},{17:[2,27],18:[2,27],21:42,23:41,25:[1,30],26:[1,37],29:[1,38],34:[2,27],38:[2,27],41:[2,27],42:[2,27]},{17:[2,28],18:[2,28],21:43,25:[1,44],26:[1,37],29:[1,38],34:[2,28],38:[2,28],41:[2,28],42:[2,28]},{41:[1,45]},{17:[2,42],18:[2,42]},{17:[2,29],18:[2,29],25:[2,29],26:[2,29],29:[2,29],34:[2,29],38:[2,29],41:[2,29],42:[2,29]},{17:[2,31],18:[2,31],25:[2,31],26:[2,31],29:[2,31],34:[2,31],38:[2,31],41:[2,31],42:[2,31]},{41:[2,43]},{8:[2,6],14:[2,6],15:[2,6],16:[2,6],24:[2,6],25:[2,6],34:[2,6],36:[2,6],38:[2,6],41:[2,6],42:[2,6]},{1:[2,9],8:[2,9],9:[2,9],14:[2,9],15:[2,9],16:[2,9],17:[2,9],18:[2,9],24:[2,9],25:[2,9],34:[2,9],36:[2,9],38:[2,9],41:[2,9],42:[2,9]},{17:[2,11],18:[2,11]},{17:[2,19],18:[2,19],34:[2,19],38:[2,19],41:[2,19],42:[2,19]},{17:[2,20],18:[2,20],34:[2,20],38:[2,20],41:[2,20],42:[2,20]},{27:46,32:47,33:[1,48]},{27:49,32:47,33:[1,48]},{17:[2,38],18:[2,38]},{17:[2,39],18:[2,39]},{17:[2,26],18:[2,26],21:50,25:[1,44],26:[1,37],29:[1,38],34:[2,26],38:[2,26],41:[2,26],42:[2,26]},{17:[2,24],18:[2,24],34:[2,24],38:[2,24],41:[2,24],42:[2,24]},{17:[2,25],18:[2,25],34:[2,25],38:[2,25],41:[2,25],42:[2,25]},{17:[2,30],18:[2,30],25:[2,30],26:[2,30],29:[2,30],34:[2,30],38:[2,30],41:[2,30],42:[2,30]},{17:[2,41],18:[2,41]},{28:[1,51],31:[1,52]},{28:[2,35],30:[2,35],31:[2,35]},{34:[1,53]},{30:[1,54],31:[1,52]},{17:[2,23],18:[2,23],34:[2,23],38:[2,23],41:[2,23],42:[2,23]},{17:[2,32],18:[2,32],34:[2,32],38:[2,32],41:[2,32],42:[2,32]},{32:55,33:[1,48]},{35:[1,56]},{17:[2,33],18:[2,33],34:[2,33],38:[2,33],41:[2,33],42:[2,33]},{28:[2,34],30:[2,34],31:[2,34]},{28:[2,36],30:[2,36],31:[2,36]}],
defaultActions: {31:[2,43]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
undefined
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
})(require("__browserify_process"))
},{"__browserify_process":14,"fs":10,"path":11}],7:[function(require,module,exports){
(function() {
  var Runtime, dataName;

  dataName = "__hamlJR_data";

  Runtime = function(context) {
    var append, lastParent, observeAttribute, observeText, pop, push, render, stack, top;
    stack = [];
    lastParent = function() {
      var element, i;
      i = stack.length - 1;
      while ((element = stack[i]) && element.nodeType === 11) {
        i -= 1;
      }
      return element;
    };
    top = function() {
      return stack[stack.length - 1];
    };
    append = function(child) {
      var _ref;
      if ((_ref = top()) != null) {
        _ref.appendChild(child);
      }
      return child;
    };
    push = function(child) {
      return stack.push(child);
    };
    pop = function() {
      return append(stack.pop());
    };
    observeAttribute = function(element, name, value) {
      var observable, update;
      update = function(newValue) {
        return element.setAttribute(name, newValue);
      };
      if (typeof Observable === "undefined" || Observable === null) {
        update(value);
        return;
      }
      observable = Observable.lift(value);
      observable.observe(update);
      return update(observable());
    };
    observeText = function(node, value) {
      var observable, unobserve, update;
      if (typeof Observable === "undefined" || Observable === null) {
        node.nodeValue = value;
        return;
      }
      observable = Observable.lift(value);
      update = function(newValue) {
        return node.nodeValue = newValue;
      };
      observable.observe(update);
      update(observable());
      unobserve = function() {};
      return node.addEventListener("DOMNodeRemoved", unobserve, true);
    };
    render = function(object) {
      var template;
      template = object.template;
      push(HAMLjr.templates[template](object));
      return pop();
    };
    return {
      __push: push,
      __pop: pop,
      __attribute: observeAttribute,
      __text: observeText,
      __each: function(items, fn) {
        var elements, parent, replace;
        items = Observable.lift(items);
        elements = [];
        parent = lastParent();
        items.observe(function(newItems) {
          return replace(elements, newItems);
        });
        replace = function(oldElements, items) {
          var firstElement;
          if (oldElements) {
            firstElement = oldElements[0];
            parent = firstElement != null ? firstElement.parentElement : void 0;
            elements = items.map(function(item) {
              var element;
              element = fn.call(item);
              element[dataName] = item;
              parent.insertBefore(element, firstElement);
              return element;
            });
            return oldElements.each(function(element) {
              return element.remove();
            });
          } else {
            return elements = items.map(function(item) {
              var element;
              element = fn.call(item);
              element[dataName] = item;
              return element;
            });
          }
        };
        return replace(null, items);
      },
      __with: function(item, fn) {
        var element, replace, value;
        element = null;
        item = Observable.lift(item);
        item.observe(function(newValue) {
          return replace(element, newValue);
        });
        value = item();
        replace = function(oldElement, value) {
          var parent;
          element = fn.call(value);
          element[dataName] = item;
          if (oldElement) {
            parent = oldElement.parentElement;
            parent.insertBefore(element, oldElement);
            return oldElement.remove();
          } else {

          }
        };
        return replace(element, value);
      },
      __on: function(eventName, fn) {
        var element;
        element = lastParent();
        if (eventName === "change") {
          switch (element.nodeName) {
            case "SELECT":
              element["on" + eventName] = function() {
                var selectedOption;
                selectedOption = this.options[this.selectedIndex];
                return fn(selectedOption[dataName]);
              };
              if (fn.observe) {
                return fn.observe(function(newValue) {
                  return Array.prototype.forEach.call(element.options, function(option, index) {
                    if (option[dataName] === newValue) {
                      return element.selectedIndex = index;
                    }
                  });
                });
              }
              break;
            default:
              element["on" + eventName] = function() {
                return fn(element.value);
              };
              if (fn.observe) {
                return fn.observe(function(newValue) {
                  return element.value = newValue;
                });
              }
          }
        } else {
          return element["on" + eventName] = function() {
            return fn.call(context, event);
          };
        }
      }
    };
  };

  exports.Runtime = Runtime;

}).call(this);

},{}],8:[function(require,module,exports){

},{}],9:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":14}],10:[function(require,module,exports){
// nothing to see here... no file methods for the browser

},{}],11:[function(require,module,exports){
(function(process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

})(require("__browserify_process"))
},{"__browserify_process":14}],12:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":9}],13:[function(require,module,exports){
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error("Cannot find module '"+r+"'")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!=="undefined"&&require,{1:[function(require,module,exports){
// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

},{"util":2,"buffer":3}],2:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":4}],5:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],"buffer-browserify":[function(require,module,exports){
module.exports=require('q9TxCC');
},{}],"q9TxCC":[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":5,"base64-js":7}],7:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],8:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],3:[function(require,module,exports){
function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        this.parent[i + this.offset] = subject[i];
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    val |= buffer.parent[buffer.offset + offset + 1];
  } else {
    val = buffer.parent[buffer.offset + offset];
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset + 1] << 16;
    val |= buffer.parent[buffer.offset + offset + 2] << 8;
    val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    val = buffer.parent[buffer.offset + offset + 2] << 16;
    val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  buffer.parent[buffer.offset + offset] = value;
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;
  } else {
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;
    buffer.parent[buffer.offset + offset] = value & 0x00ff;
  }
}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  if (isBigEndian) {
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;
  } else {
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;
    buffer.parent[buffer.offset + offset] = value & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

},{"assert":1,"./buffer_ieee754":8,"base64-js":9}],9:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},[])
;;module.exports=require("buffer-browserify")

},{}],14:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],15:[function(require,module,exports){

/**
 * Module dependencies.
 */

var whitespace = require('css-whitespace');
var mixins = require('rework-mixins');
var rework = require('rework');
var props = rework.properties;

/**
 * Expose `Style`.
 */

module.exports = Style;

/**
 * Initialize a new Style with the given css `str`.
 *
 * Options:
 *
 *  - `whitespace` utilize css whitespace transformations
 *  - `compress` enable output compression
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

function Style(str, options) {
  if (!(this instanceof Style)) return new Style(str, options);
  options = options || {};
  if (options.whitespace) str = whitespace(str);
  this.str = str;
  this.compress = options.compress;
  this.rework = rework(str);
  this.delegate(['vendors', 'use']);
  this.vendors(['-ms-', '-moz-', '-webkit-']);
}

/**
 * Delegate `methods` to rework.
 *
 * @param {Array} methods
 * @api private
 */

Style.prototype.delegate = function(methods){
  var self = this;
  methods.forEach(function(method){
    self[method] = self.rework[method].bind(self.rework);
  });
};

/**
 * Return the compiled CSS.
 *
 * @return {String}
 * @api public
 */

Style.prototype.toString = function(){
  this.use(rework.mixin(mixins));
  this.use(rework.keyframes());
  this.use(rework.ease());
  this.use(rework.prefixValue('linear-gradient'));
  this.use(rework.prefixValue('radial-gradient'));
  this.use(rework.prefixValue('transform'));
  this.use(rework.prefix(props));
  this.use(rework.colors());
  this.use(rework.references());
  this.use(rework.at2x());
  this.use(rework.extend());
  return this.rework.toString({ compress: this.compress });
};

},{"css-whitespace":16,"rework":30,"rework-mixins":21}],16:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parse = require('./lib/parser');
var compile = require('./lib/compiler');

/**
 * Compile a whitespace significant
 * `str` of CSS to the valid CSS
 * equivalent.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

module.exports = function(str){
  return compile(parse(str));
};

},{"./lib/compiler":17,"./lib/parser":19}],17:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('css-whitespace:parser');

/**
 * Compile the given `node`.
 *
 * @param {Array} node
 * @return {String}
 * @api private
 */

module.exports = function(node){
  var indents = 0;
  var rules = [];
  var stash = [];
  var level = 0;
  var nest = 0;

  if (debug.enabled) {
    var util = require('util');
    console.log(util.inspect(node, false, 12, true));
  }

  return visit(node);

  /**
   * Visit `node`.
   */

  function visit(node) {
    switch (node[0]) {
      case 'root':
        return root(node);
      case 'rule':
        if ('@' == node[1][0][0]) ++nest;
        var ret = rule(node);
        if ('@' == node[1][0][0]) --nest;
        return ret;
      case 'block':
        ++level;
        var ret = block(node);
        --level;
        return ret;
      case 'prop':
        return prop(node);
      case 'comment':
        return comment(node);
      default:
        throw new Error('invalid node "' + node[0] + '"');
    }
  }

  /**
   * Visit block.
   */

  function block(node) {
    var buf = [];
    var nodes = node[1];

    for (var i = 0; i < nodes.length; ++i) {
      buf.push(visit(nodes[i]));
    }

    return buf.join('');
  }

  /**
   * Visit comment.
   */

  function comment(node) {
    return indent() + '/*' + node[1] + '*/\n';
  }

  /**
   * Visit prop.
   */

  function prop(node) {
    var prop = node[1];
    var val = node[2];
    return indent() + prop + ': ' + val + ';\n';
  }

  /**
   * Visit rule.
   */

  function rule(node) {
    var font = '@font-face' == node[1][0].trim();
    var rule = node[1];
    var block = node[2];
    var buf = '';

    if (!block) return rule.join('') + ';';

    rules.push(node);

    if ('@' == rule[0][0] && !font) {
      buf = join(rules) + ' {\n';
      visit(block);
      buf += stash.join('\n');
      buf += '\n}';
      stash = [];
    } else if (nest && !font) {
      indents = 1;
      buf = join(rules, 1) + ' {\n';
      indents = 2;
      buf += visit(block);
      buf += '  }';
      indents = 1;
    } else {
      indents = 0;
      buf = join(rules) + ' {\n'
      indents = 1;
      buf += visit(block);
      indents = 0;
      buf += '}';
      if (!hasProperties(block)) buf = '';
    }

    if (rules.length > 1) {
      if (hasProperties(block)) stash.push(buf);
      buf = '';
    }

    rules.pop();

    return buf;
  }

  /**
   * Visit root.
   */

  function root(node) {
    var buf = [];
    for (var i = 0; i < node[1].length; ++i) {
      buf.push(visit(node[1][i]));
      if (stash.length) {
        buf = buf.concat(stash);
        stash = [];
      }
    }
    return buf.join('\n\n');
  }

  /**
   * Join the given rules.
   *
   * @param {Array} rules
   * @param {Number} [offset]
   * @return {String}
   * @api private
   */

  function join(rules, offset) {
    offset = offset || 0;
    var selectors = [];
    var buf = [];
    var curr;
    var next;

    function compile(rules, i) {
      if (offset != i) {
        rules[i][1].forEach(function(selector){
          var parent = ~selector.indexOf('&');
          selector = selector.replace('&', '');
          buf.unshift(parent ? selector : ' ' + selector);
          compile(rules, i - 1);
          buf.shift();
        });
      } else {
        rules[i][1].forEach(function(selector){
          var tail = buf.join('');
          selectors.push(indent() + selector + tail);
        });
      }
    }

    compile(rules, rules.length - 1);

    return selectors.join(',\n');
  }

  /**
   * Return indent.
   */

  function indent() {
    return Array(indents + 1).join('  ');
  }
};

/**
 * Check if `block` has properties.
 *
 * @param {Array} block
 * @return {Boolean}
 * @api private
 */

function hasProperties(block) {
  var nodes = block[1];
  for (var i = 0; i < nodes.length; ++i) {
    if ('prop' == nodes[i][0]) return true;
  }
  return false;
}

/**
 * Blank string filter.
 *
 * @api private
 */

function blank(str) {
  return '' != str;
}

},{"debug":20,"util":12}],18:[function(require,module,exports){

/**
 * Pesudo selectors.
 */

var pseudos = [
  ':selection',
  'fullscreen',
  'nth-child',
  'first-child',
  'last-child',
  'link',
  'visited',
  'hover',
  'active',
  'focus',
  'first-letter',
  'first-line',
  'before',
  'after',
  'lang',
  'enabled',
  'disabled',
  'only-child',
  'only-of-type',
  'first-of-type',
  'last-of-type',
  'nth-last-of-type',
  'nth-of-type',
  'root',
  'empty',
  'target',
  'not',
  '-o',
  '-ms',
  '-moz',
  '-webkit'
]

/**
 * Property regexp.
 */

pseudos = pseudos.join('|');
var propre = new RegExp('^ *([-\\w]+):(?!' + pseudos + ') *([^\n]*)');

/**
 * Scan the given `str` returning tokens.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

module.exports = function(str) {
  var indents = [0];
  var stash = [];

  // strip blanks
  str = str.replace(/\r/g, '');
  str = str.replace(/\n\s*\n/gm, '\n');

  return scan();

  /**
   * tok+
   */

  function scan() {
    var toks = []
      , curr;

    while (str.length) {
      curr = next();
      curr && toks.push(curr);
      if (str.length && !curr) {
        throw new Error('syntax error near "' + str.slice(0, 10) + '"');
      }
    }

    toks = toks.concat(stash);
    while (indents.pop()) toks.push(['outdent']);
    toks.push(['eos']);
    return toks;
  }

  /**
   *   eos
   * | indentation
   * | rule
   */

  function next() {
    return stashed()
      || comment()
      || csscomment()
      || indentation()
      || prop()
      || rule();
  }

  /**
   * Deferred tokens.
   */

  function stashed() {
    return stash.shift();
  }

  /**
   * Comment.
   */

  function comment() {
    var m = str.match(/^\/\/([^\n]*)/);
    if (!m) return;
    str = str.slice(m[0].length);
    return next();
  }

  /**
   * Multiline comment.
   */

  function csscomment() {
    if ('/' != str[0] || '*' != str[1]) return;
    str = str.slice(2);

    var i = 0;
    while ('*' != str[i] && '/' != str[i + 1]) ++i;

    var buf = str.slice(0, i);
    str = str.slice(buf.length + 2);

    return ['comment', buf];
  }

  /**
   *   INDENT
   * | OUTDENT
   */

  function indentation() {
    var spaces = str.match(/^\n( *)/);
    if (!spaces) return;
    str = str.slice(spaces[0].length);
    spaces = spaces[1].length;
    var prev = indents[indents.length - 1];

    // INDENT
    if (spaces > prev) return indent(spaces);

    // OUTDENT
    if (spaces < prev) return outdent(spaces);

    return next();
  }

  /**
   * Indent.
   */

  function indent(spaces) {
    indents.push(spaces);
    return ['indent'];
  }

  /**
   * Outdent.
   */

  function outdent(spaces) {
    while (indents[indents.length - 1] > spaces) {
      indents.pop();
      stash.push(['outdent']);
    }
    return stashed();
  }

  /**
   * Property.
   */

  function prop() {
    var m = str.match(propre);
    if (!m) return;
    str = str.slice(m[0].length);
    return ['prop', m[1], m[2]];
  }

  /**
   * Rule.
   */

  function rule() {
    var m = str.match(/^([^\n,]+, *\n|[^\n]+)+/);
    if (!m) return;
    str = str.slice(m[0].length);
    m = m[0].split(/\s*,\s*/);
    return ['rule', m];
  }
}

},{}],19:[function(require,module,exports){
/**
 * Module dependencies.
 */

var debug = require('debug')('css-whitespace:lexer');
var scan = require('./lexer');

/**
 * Parse the given `str`, returning an AST.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

module.exports = function(str) {
  var toks = scan(str);

  if (debug.enabled) {
    var util = require('util');
    console.log(util.inspect(toks, false, 12, true));
  }

  return stmts();

  /**
   * Grab the next token.
   */

  function next() {
    return toks.shift();
  }

  /**
   * Check if the next token is `type`.
   */

  function is(type) {
    if (type == toks[0][0]) return true;
  }

  /**
   * Expect `type` or throw.
   */

  function expect(type) {
    if (is(type)) return next();
    throw new Error('expected "' + type + '", but got "' + toks[0][0] + '"');
  }

  /**
   * stmt+
   */

  function stmts() {
    var stmts = [];
    while (!is('eos')) stmts.push(stmt());
    return ['root', stmts];
  }

  /**
   * INDENT stmt+ OUTDENT
   */

  function block() {
    var props = [];
    expect('indent');
    while (!is('outdent')) props.push(stmt());
    expect('outdent');
    return ['block', props];
  }

  /**
   *   rule
   * | prop
   */

  function stmt() {
    if (is('rule')) return rule();
    if (is('prop')) return prop();
    return next();
  }

  /**
   *   prop
   * | prop INDENT rule* OUTDENT
   */

  function prop() {
    var prop = next();
    if (is('indent')) {
      next();
      while (!is('outdent')) {
        var tok = next();
        prop[2] += ' ' + tok[1].join(', ');
      }
      expect('outdent');
    }
    return prop;
  }

  /**
   * rule block?
   */

  function rule() {
    var rule = next();
    if (is('indent')) rule.push(block());
    return rule;
  }
}

},{"./lexer":18,"debug":20,"util":12}],20:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

// persist

if (window.localStorage) debug.enable(localStorage.debug);

},{}],21:[function(require,module,exports){

exports['border-radius'] = require('./lib/border-radius');
exports['overflow'] = require('./lib/ellipsis');
exports['absolute'] = require('./lib/absolute');
exports['relative'] = require('./lib/relative');
exports['fixed'] = require('./lib/fixed');
exports['opacity'] = require('./lib/opacity');
exports['size'] = require('./lib/size');

},{"./lib/absolute":22,"./lib/border-radius":23,"./lib/ellipsis":24,"./lib/fixed":25,"./lib/opacity":26,"./lib/relative":28,"./lib/size":29}],22:[function(require,module,exports){

/**
 * absolute: top left
 * absolute: top 5px left 5px
 */

module.exports = require('./position')('absolute');

},{"./position":27}],23:[function(require,module,exports){

/**
 * Positions.
 */

var position = {
  top: true,
  left: true,
  right: true,
  bottom: true
};

/**
 * border-radius: 5px
 * border-radius: 5px 10px
 * border-radius: top 5px
 * border-radius: top 5px left 10px
 */

module.exports = function(str){
  var vals = str.split(/\s+/);
  var pos;
  var ret;

  for (var i = 0; i < vals.length; ++i) {
    var val = vals[i];
    if (!position[val]) continue;
    ret = ret || {};
    pos = val;
    val = vals[++i];
    switch (pos) {
      case 'top':
      case 'bottom':
        ret['border-' + pos + '-left-radius'] = val;
        ret['border-' + pos + '-right-radius'] = val;
        break;
      case 'left':
      case 'right':
        ret['border-top-' + pos + '-radius'] = val;
        ret['border-bottom-' + pos + '-radius'] = val;
        break;
    }
  }

  if (!ret) {
    return {
      'border-radius': str
    }
  }

  return ret;
};

},{}],24:[function(require,module,exports){

/**
 * overflow: ellipsis
 */

module.exports = function(type) {
  if ('ellipsis' == type) {
    return {
      'white-space': 'nowrap',
      'overflow': 'hidden',
      'text-overflow': 'ellipsis'
    }
  }

  return {
    'overflow': type
  };
};

},{}],25:[function(require,module,exports){

/**
 * fixed: top left
 * fixed: top 5px left 5px
 */

module.exports = require('./position')('fixed');

},{"./position":27}],26:[function(require,module,exports){

/**
 * opacity: 1
 */

module.exports = function(str){
  var vals = str.split(/\s+/);
  var a = parseFloat(vals.shift());
  var n = a * 100 | 0;
  var tail = vals.length ? ' ' + vals.join(' '): '';
  return {
    'opacity': a + tail,
    '-ms-filter': 'progid:DXImageTransform.Microsoft.Alpha(Opacity=' + n + ')' + tail,
    'filter': 'alpha(opacity=' + n + ')' + tail
  }
};

},{}],27:[function(require,module,exports){

/**
 * Positions.
 */

var positions = {
  top: true,
  left: true,
  right: true,
  bottom: true
};

/**
 * Return a mixin for the given position `type`.
 *
 * @param {String} type
 * @return {Function}
 * @api private
 */

module.exports = function(type){
  return function(str){
    var val;
    var pos;
    var ret = {};
    var vals = str.split(/\s+/);

    ret.position = type;

    for (var i = 0; i < vals.length; ++i) {
      val = vals[i];
      if (positions[val]) {
        pos = val;
        ret[pos] = '0';
      } else {
        ret[pos] = val;
      }
    }

    return ret;
  };
}

},{}],28:[function(require,module,exports){

/**
 * relative: top left
 * relative: top 5px left 5px
 */

module.exports = require('./position')('relative');

},{"./position":27}],29:[function(require,module,exports){
/**
 * size: 100px 50px
 */

module.exports = function(sizes) {
  sizes = sizes.split(/\s+/);
  if ( sizes.length == 1 ) sizes[1] = sizes[0];

  return {
    width:  sizes[0],
    height: sizes[1]
  };
};

},{}],30:[function(require,module,exports){

module.exports = require('./lib/rework');
},{"./lib/rework":45}],31:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('../utils');
var path = require('path');
var stripQuotes = utils.stripQuotes;

/**
 * Translate
 *
 *   .logo {
 *     background-image: url('/public/images/logo.png')
 *   }
 *
 * yields:
 *
 *   .logo {
 *     background-image: url('/public/images/logo.png')
 *   }
 *
 *   @media all and (-webkit-min-device-pixel-ratio : 1.5) {
 *     .logo {
 *       background-image: url("/public/images/logo@2x.png");
 *       background-size: contain
 *     }
 *   }
 *
 */

module.exports = function(vendors) {
  return function(style, rework){
    vendors = vendors || rework.prefixes;

    style.rules.forEach(function(rule){
      if (!rule.declarations) return;

      var backgroundSize = rule.declarations.filter(backgroundWithSize).map(value)[0] || 'contain';

      rule.declarations.filter(backgroundWithURL).forEach(function(decl){
        if ('comment' == decl.type) return;

        // parse url
        var i = decl.value.indexOf('url(');
        var url = stripQuotes(decl.value.slice(i + 4, decl.value.indexOf(')', i)));
        var ext = path.extname(url);

        // ignore .svg
        if ('.svg' == ext) return;

        // @2x value
        url = path.join(path.dirname(url), path.basename(url, ext) + '@2x' + ext);

        // wrap in @media
        style.rules.push({
          type: 'media',
          media: 'all and (-webkit-min-device-pixel-ratio: 1.5)',
          rules: [
            {
              type: 'rule',
              selectors: rule.selectors,
              declarations: [
                {
                  type: 'declaration',
                  property: 'background-image',
                  value: 'url("' + url + '")'
                },
                {
                  type: 'declaration',
                  property: 'background-size',
                  value: backgroundSize
                }
              ]
            }
          ]
        });
      });
    });
  };

  return function(style, rework) {
    vendors = vendors || rework.prefixes;
    visit(style.rules, style);
  };
};

/**
 * Filter background[-image] with url().
 */

function backgroundWithURL(decl) {
  return ('background' == decl.property
    || 'background-image' == decl.property)
    && ~decl.value.indexOf('url(');
}

/**
 * Predicate on background-size property.
 */

function backgroundWithSize(decl) {
  return 'background-size' == decl.property;
}

/**
 * Return value atribute of a declaration.
 */

function value(decl) {
  return decl.value;
}

},{"../utils":46,"path":11}],32:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parse = require('color-parser');
var functions = require('./function');

/**
 * Provide color manipulation helpers:
 *
 *    button {
 *      background: rgba(#eee, .5)
 *    }
 *
 * yields:
 *
 *    button {
 *      background: rgba(238, 238, 238, .5)
 *    }
 *
 */

module.exports = function() {
  return functions({
    rgba: function(color, alpha){
      if (2 == arguments.length) {
        var c = parse(color.trim());
        var args = [c.r, c.g, c.b, alpha];
      } else {
        var args = [].slice.call(arguments);
      }

      return 'rgba(' + args.join(', ') + ')';
    }
  });
};

},{"./function":34,"color-parser":49}],33:[function(require,module,exports){

/**
 * Module dependencies.
 */

var visit = require('../visit');

/**
 * Easing functions.
 */

var ease = {
  'ease-in-out-back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
  'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
  'ease-in-out-expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
  'ease-in-out-sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
  'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
  'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
  'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
  'ease-in-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
  'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
  'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
  'ease-out-expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  'ease-out-sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
  'ease-out-quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
  'ease-out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
  'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
  'ease-out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  'ease-in-back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
  'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
  'ease-in-expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
  'ease-in-sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
  'ease-in-quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
  'ease-in-quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
  'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
  'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)'
};

/**
 * Keys.
 */

var keys = Object.keys(ease);

/**
 * Provide additional easing functions:
 *
 *    #logo {
 *      transition: all 500ms ease-out-back;
 *    }
 *
 * yields:
 *
 *    #logo {
 *      transition: all 500ms cubic-bezier(0.175, 0.885, 0.320, 1.275)
 *    }
 *
 */

module.exports = function() {
  return function(style, rework){
    visit.declarations(style, substitute);
  }
};

/**
 * Substitute easing functions.
 *
 * @api private
 */

function substitute(declarations) {
  for (var i = 0, len = declarations.length; i < len; ++i) {
    var decl = declarations[i];
    if ('comment' == decl.type) continue;
    if (!decl.property.match(/transition|animation|timing/)) continue;
    for (var k = 0; k < keys.length; ++k) {
      var key = keys[k];
      if (~decl.value.indexOf(key)) {
        decl.value = decl.value.replace(key, ease[key]);
        break;
      }
    }
  }
}

},{"../visit":47}],34:[function(require,module,exports){

/**
 * Module dependencies.
 */

var visit = require('../visit');
var utils = require('../utils');
var strip = utils.stripQuotes;

/**
 * Define custom function.
 */

module.exports = function(functions, args) {
  if (!functions) throw new Error('functions object required');
  return function(style, rework){
    visit.declarations(style, function(declarations){
      for (var name in functions) {
        func(declarations, name, functions[name], args);
      }
    });
  }
};

/**
 * Escape regexp codes in string.
 *
 * @param {String} s
 * @api private
 */

function escape(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Visit declarations and apply functions.
 *
 * @param {Array} declarations
 * @param {Object} functions
 * @param {Boolean} [parseArgs]
 * @api private
 */

function func(declarations, name, func, parseArgs) {
  if (false !== parseArgs) parseArgs = true;
  var regexp = new RegExp(escape(name) + '\\(([^\)]+)\\)', 'g');
  declarations.forEach(function(decl){
    if ('comment' == decl.type) return;
    if (!~decl.value.indexOf(name + '(')) return;
    decl.value = decl.value.replace(regexp, function(_, args){
      if (!parseArgs) return func.call(decl, strip(args));
      args = args.split(/,\s*/).map(strip);
      return func.apply(decl, args);
    });
  });
}

},{"../utils":46,"../visit":47}],35:[function(require,module,exports){
(function(Buffer){
/**
 * Module dependencies.
 */

var func = require('./function');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var read = fs.readFileSync;
var exists = fs.existsSync;

/**
 * Inline images and fonts.
 *
 *    .logo {
 *      background: inline(icons/logo.png);
 *    }
 *
 * yields:
 *
 *    .logo {
 *      background: url("data:image/png;base64,iVBORw0…");
 *    }
 *
 */

module.exports = function(dirs) {
  if (!Array.isArray(dirs)) {
    dirs = Array.prototype.slice.call(arguments);
  }

  function inline(filename){
    var file = dirs.map(function(dir) {
      return path.join(dir, filename);
    }).filter(exists)[0];

    if (!file) throw new Error('inline(): failed to find "' + filename + '"');

    var type = mime.lookup(file);
    var base64 = new Buffer(read(file)).toString('base64');
    return 'url("data:' + type + ';base64,' + base64 + '")';
  }

  return func({ inline: inline });
};

})(require("__browserify_Buffer").Buffer)
},{"./function":34,"__browserify_Buffer":13,"fs":10,"mime":55,"path":11}],36:[function(require,module,exports){

/**
 * Prefix keyframes.
 *
 *   @keyframes animation {
 *     from {
 *       opacity: 0;
 *     }
 *
 *     to {
 *       opacity: 1;
 *     }
 *   }
 *
 * yields:
 *
 *   @keyframes animation {
 *     from {
 *       opacity: 0;
 *     }
 *
 *     to {
 *       opacity: 1;
 *     }
 *   }
 *
 *   @-webkit-keyframes animation {
 *     from {
 *       opacity: 0;
 *     }
 *
 *     to {
 *       opacity: 1;
 *     }
 *   }
 *
 */

module.exports = function(vendors) {
  return function(style, rework){
    vendors = vendors || rework.prefixes;

    style.rules.forEach(function(rule){
      if (!rule.keyframes) return;

      vendors.forEach(function(vendor){
        if (vendor == rule.vendor) return;
        var clone = cloneKeyframes(rule);
        clone.vendor = vendor;
        style.rules.push(clone);
      });
    });
  }
};

/**
 * Clone keyframes.
 *
 * @param {Object} rule
 * @api private
 */

function cloneKeyframes(rule) {
  var clone = { name: rule.name };
  clone.type = 'keyframes';
  clone.vendor = rule.vendor;
  clone.keyframes = [];
  rule.keyframes.forEach(function(keyframe){
    clone.keyframes.push(cloneKeyframe(keyframe));
  });
  return clone;
}

/**
 * Clone `keyframe`.
 *
 * @param {Object} keyframe
 * @api private
 */

function cloneKeyframe(keyframe) {
  var clone = {};
  clone.type = 'keyframe';
  clone.values = keyframe.values.slice();
  clone.declarations = keyframe.declarations.map(function(decl){
    if ('comment' == decl.type) {
      return decl;
    }

    return {
      type: 'declaration',
      property: decl.property,
      value: decl.value
    }
  });
  return clone;
}

},{}],37:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('../utils');
var visit = require('../visit');

/**
 * Define custom mixins.
 */

module.exports = function(mixins) {
  if (!mixins) throw new Error('mixins object required');
  return function(style, rework){
    visit.declarations(style, function(declarations){
      mixin(rework, declarations, mixins);
    });
  }
};

/**
 * Visit declarations and apply mixins.
 *
 * @param {Rework} rework
 * @param {Array} declarations
 * @param {Object} mixins
 * @api private
 */

function mixin(rework, declarations, mixins) {
  for (var i = 0; i < declarations.length; ++i) {
    var decl = declarations[i];
    if ('comment' == decl.type) continue;

    var key = decl.property;
    var val = decl.value;
    var fn = mixins[key];
    if (!fn) continue;

    // invoke mixin
    var ret = fn.call(rework, val);

    // apply properties
    for (var key in ret) {
      var val = ret[key];
      if (Array.isArray(val)) {
        val.forEach(function(val){
          declarations.splice(i++, 0, {
            type: 'declaration',
            property: key,
            value: val
          });
        });
      } else {
        declarations.splice(i++, 0, {
          type: 'declaration',
          property: key,
          value: val
        });
      }
    }

    // remove original
    declarations.splice(i--, 1);
  }
}

},{"../utils":46,"../visit":47}],38:[function(require,module,exports){

/**
 * Prefix selectors with `str`.
 *
 *    button {
 *      color: red;
 *    }
 *
 * yields:
 *
 *    #dialog button {
 *      color: red;
 *    }
 *
 */

module.exports = function(str) {
  return function(style){
    style.rules = style.rules.map(function(rule){
      if (!rule.selectors) return rule;
      rule.selectors = rule.selectors.map(function(selector){
        return str + ' ' + selector;
      });
      return rule;
    });
  }
};
},{}],39:[function(require,module,exports){

/**
 * Module dependencies.
 */

var visit = require('../visit');

/**
 * Prefix `value`.
 *
 *    button {
 *      transition: height, transform 2s, width 0.3s linear;
 *    }
 *
 * yields:
 *
 *    button {
 *      -webkit-transition: height, -webkit-transform 2s, width 0.3s linear;
 *      -moz-transition: height, -moz-transform 2s, width 0.3s linear;
 *      transition: height, transform 2s, width 0.3s linear
 *    }
 *
 */

module.exports = function(value, vendors) {
  return function(style, rework){
    vendors = vendors || rework.prefixes;

    visit.declarations(style, function(declarations){
      for (var i = 0; i < declarations.length; ++i) {
        var decl = declarations[i];
        if ('comment' == decl.type) continue;
        if (!~decl.value.indexOf(value)) continue;

        // ignore vendor-prefixed properties
        if ('-' == decl.property[0]) continue;

        // ignore vendor-prefixed values
        if (~decl.value.indexOf('-' + value)) continue;

        // vendor prefixed props
        vendors.forEach(function(vendor){
          var prop = 'transition' == decl.property
            ? vendor + decl.property
            : decl.property;

          declarations.splice(i++, 0, {
            type: 'declaration',
            property: prop,
            value: decl.value.replace(value, vendor + value)
          });
        });
      }
    });
  }
};

},{"../visit":47}],40:[function(require,module,exports){

/**
 * Module dependencies.
 */

var visit = require('../visit');

/**
 * Prefix `prop`.
 *
 *   .button {
 *     border-radius: 5px;
 *   }
 *
 * yields:
 *
 *   .button {
 *     -webkit-border-radius: 5px;
 *     -moz-border-radius: 5px;
 *     border-radius: 5px;
 *   }
 *
 */

module.exports = function(prop, vendors) {
  var props = Array.isArray(prop)
    ? prop
    : [prop];

  return function(style, rework){
    vendors = vendors || rework.prefixes;
    visit.declarations(style, function(declarations, node){
      var only = node.vendor;
      var isKeyframes = !! node.keyframes;

      for (var i = 0; i < props.length; ++i) {
        var prop = props[i];

        for (var j = 0, len = declarations.length; j < len; ++j) {
          var decl = declarations[j];
          if ('comment' == decl.type) continue;
          if (prop != decl.property) continue;

          // vendor prefixed props
          for (var k = 0; k < vendors.length; ++k) {
            if (!only && isKeyframes) continue;
            if (only && only != vendors[k]) continue;
            declarations.push({
              type: 'declaration',
              property: vendors[k] + decl.property,
              value: decl.value
            });
          }

          // original prop
          declarations.push(decl);
          declarations.splice(j, 1);
        }
      }
    });
  }
};

},{"../visit":47}],41:[function(require,module,exports){

/**
 * Module dependencies.
 */

var visit = require('../visit');

/**
 * Provide property reference support.
 *
 *    button {
 *      width: 50px;
 *      height: @width;
 *      line-height: @height;
 *    }
 *
 * yields:
 *
 *    button {
 *      width: 50px;
*       height: 50px;
*       line-height: 50px;
 *    }
 *
 */

module.exports = function() {
  return function(style, rework){
    visit.declarations(style, substitute);
  }
};

/**
 * Substitute easing functions.
 *
 * @api private
 */

function substitute(declarations) {
  var map = {};

  for (var i = 0, len = declarations.length; i < len; ++i) {
    var decl = declarations[i];
    var key = decl.property;
    var val = decl.value;

    if ('comment' == decl.type) continue;

    decl.value = val.replace(/@([-\w]+)/g, function(_, name){
      // TODO: fix this problem for real with visionmedia/css-value
      if ('2x' == name) return '@' + name;
      if (null == map[name]) throw new Error('@' + name + ' is not defined in this scope');
      return map[name];
    });

    map[key] = decl.value;
  }
}

},{"../visit":47}],42:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('../utils');
var func = require('./function');

/**
 * Map `url()` calls.
 *
 *   body {
 *     background: url(/images/bg.png);
 *   }
 *
 * yields:
 *
 *   body {
 *     background: url(http://example.com/images/bg.png);
 *   }
 *
 */

module.exports = function(fn) {
  return func({
    url: function(path){
      return 'url("' + fn(path) + '")';
    }
  }, false);
};

},{"../utils":46,"./function":34}],43:[function(require,module,exports){

module.exports = function(){
  console.warn('Warning: vars() has been removed, please use: https://github.com/visionmedia/rework-vars');
  return function(){}
};

},{}],44:[function(require,module,exports){

/**
 * Prefixed properties.
 */

module.exports = [
  'animation',
  'animation-delay',
  'animation-direction',
  'animation-duration',
  'animation-fill-mode',
  'animation-iteration-count',
  'animation-name',
  'animation-play-state',
  'animation-timing-function',
  'appearance',
  'background-visibility',
  'background-composite',
  'blend-mode',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-fit',
  'border-image',
  'border-vertical-spacing',
  'box-align',
  'box-direction',
  'box-flex',
  'box-flex-group',
  'box-lines',
  'box-ordinal-group',
  'box-orient',
  'box-pack',
  'box-reflect',
  'box-sizing',
  'clip-path',
  'column-count',
  'column-width',
  'column-min-width',
  'column-width-policy',
  'column-gap',
  'column-rule',
  'column-rule-color',
  'column-rule-style',
  'column-rule-width',
  'column-span',
  'flex',
  'flex-basis',
  'flex-direction',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-wrap',
  'flex-flow-from',
  'flex-flow-into',
  'font-smoothing',
  'transform',
  'transform-origin',
  'transform-origin-x',
  'transform-origin-y',
  'transform-origin-z',
  'transform-style',
  'transition',
  'transition-delay',
  'transition-duration',
  'transition-property',
  'transition-timing-function',
  'user-drag',
  'user-modify',
  'user-select',
  'wrap',
  'wrap-flow',
  'wrap-margin',
  'wrap-padding',
  'wrap-through',
  'overflow-scrolling'
];

},{}],45:[function(require,module,exports){
(function(){
/**
 * Module dependencies.
 */

var css = require('css');

/**
 * Expose `rework`.
 */

exports = module.exports = rework;

/**
 * Expose `visit` helpers.
 */

exports.visit = require('./visit');

/**
 * Expose prefix properties.
 */

exports.properties = require('./properties');

/**
 * Initialize a new stylesheet `Rework` with `str`.
 *
 * @param {String} str
 * @return {Rework}
 * @api public
 */

function rework(str) {
  return new Rework(css.parse(str));
}

/**
 * Initialize a new stylesheet `Rework` with `obj`.
 *
 * @param {Object} obj
 * @api private
 */

function Rework(obj) {
  this.obj = obj;
}

/**
 * Use the given plugin `fn(style, rework)`.
 *
 * @param {Function} fn
 * @return {Rework}
 * @api public
 */

Rework.prototype.use = function(fn){
  fn(this.obj.stylesheet, this);
  return this;
};

/**
 * Specify global vendor `prefixes`,
 * explicit ones may still be passed
 * to most plugins.
 *
 * @param {Array} prefixes
 * @return {Rework}
 * @api public
 */

Rework.prototype.vendors = function(prefixes){
  this.prefixes = prefixes;
  return this;
};

/**
 * Stringify the stylesheet.
 *
 * @param {Object} options
 * @return {String}
 * @api public
 */

Rework.prototype.toString = function(options){
  return css.stringify(this.obj, options);
};

/**
 * Expose plugins.
 */

exports.mixin = exports.mixins = require('./plugins/mixin');
exports.function = exports.functions = require('./plugins/function');
exports.prefix = require('./plugins/prefix');
exports.colors = require('./plugins/colors');
exports.extend = require('rework-inherit');
exports.references = require('./plugins/references');
exports.prefixValue = require('./plugins/prefix-value');
exports.prefixSelectors = require('./plugins/prefix-selectors');
exports.keyframes = require('./plugins/keyframes');
exports.at2x = require('./plugins/at2x');
exports.url = require('./plugins/url');
exports.ease = require('./plugins/ease');
exports.vars = require('./plugins/vars');

/**
 * Try/catch plugins unavailable in component.
 */

 try {
  exports.inline = require('./plugins/inline');
} catch (err) {};


})()
},{"./plugins/at2x":31,"./plugins/colors":32,"./plugins/ease":33,"./plugins/function":34,"./plugins/inline":35,"./plugins/keyframes":36,"./plugins/mixin":37,"./plugins/prefix":40,"./plugins/prefix-selectors":38,"./plugins/prefix-value":39,"./plugins/references":41,"./plugins/url":42,"./plugins/vars":43,"./properties":44,"./visit":47,"css":50,"rework-inherit":56}],46:[function(require,module,exports){

/**
 * Strip `str` quotes.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.stripQuotes = function(str) {
  if ('"' == str[0] || "'" == str[0]) return str.slice(1, -1);
  return str;
};
},{}],47:[function(require,module,exports){

// TODO: require() directly in plugins...
exports.declarations = require('rework-visit');

},{"rework-visit":57}],48:[function(require,module,exports){

module.exports = {
    aliceblue: [240, 248, 255]
  , antiquewhite: [250, 235, 215]
  , aqua: [0, 255, 255]
  , aquamarine: [127, 255, 212]
  , azure: [240, 255, 255]
  , beige: [245, 245, 220]
  , bisque: [255, 228, 196]
  , black: [0, 0, 0]
  , blanchedalmond: [255, 235, 205]
  , blue: [0, 0, 255]
  , blueviolet: [138, 43, 226]
  , brown: [165, 42, 42]
  , burlywood: [222, 184, 135]
  , cadetblue: [95, 158, 160]
  , chartreuse: [127, 255, 0]
  , chocolate: [210, 105, 30]
  , coral: [255, 127, 80]
  , cornflowerblue: [100, 149, 237]
  , cornsilk: [255, 248, 220]
  , crimson: [220, 20, 60]
  , cyan: [0, 255, 255]
  , darkblue: [0, 0, 139]
  , darkcyan: [0, 139, 139]
  , darkgoldenrod: [184, 132, 11]
  , darkgray: [169, 169, 169]
  , darkgreen: [0, 100, 0]
  , darkgrey: [169, 169, 169]
  , darkkhaki: [189, 183, 107]
  , darkmagenta: [139, 0, 139]
  , darkolivegreen: [85, 107, 47]
  , darkorange: [255, 140, 0]
  , darkorchid: [153, 50, 204]
  , darkred: [139, 0, 0]
  , darksalmon: [233, 150, 122]
  , darkseagreen: [143, 188, 143]
  , darkslateblue: [72, 61, 139]
  , darkslategray: [47, 79, 79]
  , darkslategrey: [47, 79, 79]
  , darkturquoise: [0, 206, 209]
  , darkviolet: [148, 0, 211]
  , deeppink: [255, 20, 147]
  , deepskyblue: [0, 191, 255]
  , dimgray: [105, 105, 105]
  , dimgrey: [105, 105, 105]
  , dodgerblue: [30, 144, 255]
  , firebrick: [178, 34, 34]
  , floralwhite: [255, 255, 240]
  , forestgreen: [34, 139, 34]
  , fuchsia: [255, 0, 255]
  , gainsboro: [220, 220, 220]
  , ghostwhite: [248, 248, 255]
  , gold: [255, 215, 0]
  , goldenrod: [218, 165, 32]
  , gray: [128, 128, 128]
  , green: [0, 128, 0]
  , greenyellow: [173, 255, 47]
  , grey: [128, 128, 128]
  , honeydew: [240, 255, 240]
  , hotpink: [255, 105, 180]
  , indianred: [205, 92, 92]
  , indigo: [75, 0, 130]
  , ivory: [255, 255, 240]
  , khaki: [240, 230, 140]
  , lavender: [230, 230, 250]
  , lavenderblush: [255, 240, 245]
  , lawngreen: [124, 252, 0]
  , lemonchiffon: [255, 250, 205]
  , lightblue: [173, 216, 230]
  , lightcoral: [240, 128, 128]
  , lightcyan: [224, 255, 255]
  , lightgoldenrodyellow: [250, 250, 210]
  , lightgray: [211, 211, 211]
  , lightgreen: [144, 238, 144]
  , lightgrey: [211, 211, 211]
  , lightpink: [255, 182, 193]
  , lightsalmon: [255, 160, 122]
  , lightseagreen: [32, 178, 170]
  , lightskyblue: [135, 206, 250]
  , lightslategray: [119, 136, 153]
  , lightslategrey: [119, 136, 153]
  , lightsteelblue: [176, 196, 222]
  , lightyellow: [255, 255, 224]
  , lime: [0, 255, 0]
  , limegreen: [50, 205, 50]
  , linen: [250, 240, 230]
  , magenta: [255, 0, 255]
  , maroon: [128, 0, 0]
  , mediumaquamarine: [102, 205, 170]
  , mediumblue: [0, 0, 205]
  , mediumorchid: [186, 85, 211]
  , mediumpurple: [147, 112, 219]
  , mediumseagreen: [60, 179, 113]
  , mediumslateblue: [123, 104, 238]
  , mediumspringgreen: [0, 250, 154]
  , mediumturquoise: [72, 209, 204]
  , mediumvioletred: [199, 21, 133]
  , midnightblue: [25, 25, 112]
  , mintcream: [245, 255, 250]
  , mistyrose: [255, 228, 225]
  , moccasin: [255, 228, 181]
  , navajowhite: [255, 222, 173]
  , navy: [0, 0, 128]
  , oldlace: [253, 245, 230]
  , olive: [128, 128, 0]
  , olivedrab: [107, 142, 35]
  , orange: [255, 165, 0]
  , orangered: [255, 69, 0]
  , orchid: [218, 112, 214]
  , palegoldenrod: [238, 232, 170]
  , palegreen: [152, 251, 152]
  , paleturquoise: [175, 238, 238]
  , palevioletred: [219, 112, 147]
  , papayawhip: [255, 239, 213]
  , peachpuff: [255, 218, 185]
  , peru: [205, 133, 63]
  , pink: [255, 192, 203]
  , plum: [221, 160, 203]
  , powderblue: [176, 224, 230]
  , purple: [128, 0, 128]
  , red: [255, 0, 0]
  , rosybrown: [188, 143, 143]
  , royalblue: [65, 105, 225]
  , saddlebrown: [139, 69, 19]
  , salmon: [250, 128, 114]
  , sandybrown: [244, 164, 96]
  , seagreen: [46, 139, 87]
  , seashell: [255, 245, 238]
  , sienna: [160, 82, 45]
  , silver: [192, 192, 192]
  , skyblue: [135, 206, 235]
  , slateblue: [106, 90, 205]
  , slategray: [119, 128, 144]
  , slategrey: [119, 128, 144]
  , snow: [255, 255, 250]
  , springgreen: [0, 255, 127]
  , steelblue: [70, 130, 180]
  , tan: [210, 180, 140]
  , teal: [0, 128, 128]
  , thistle: [216, 191, 216]
  , tomato: [255, 99, 71]
  , turquoise: [64, 224, 208]
  , violet: [238, 130, 238]
  , wheat: [245, 222, 179]
  , white: [255, 255, 255]
  , whitesmoke: [245, 245, 245]
  , yellow: [255, 255, 0]
  , yellowgreen: [154, 205, 5]
};
},{}],49:[function(require,module,exports){

/**
 * Module dependencies.
 */

var colors = require('./colors');

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Parse `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

function parse(str) {
  return named(str)
    || hex3(str)
    || hex6(str)
    || rgb(str)
    || rgba(str);
}

/**
 * Parse named css color `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function named(str) {
  var c = colors[str.toLowerCase()];
  if (!c) return;
  return {
    r: c[0],
    g: c[1],
    b: c[2]
  }
}

/**
 * Parse rgb(n, n, n)
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function rgb(str) {
  if (0 == str.indexOf('rgb(')) {
    str = str.match(/rgb\(([^)]+)\)/)[1];
    var parts = str.split(/ *, */).map(Number);
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: 1
    }
  }
}

/**
 * Parse rgba(n, n, n, n)
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function rgba(str) {
  if (0 == str.indexOf('rgba(')) {
    str = str.match(/rgba\(([^)]+)\)/)[1];
    var parts = str.split(/ *, */).map(Number);
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts[3]
    }
  }
}

/**
 * Parse #nnnnnn
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function hex6(str) {
  if ('#' == str[0] && 7 == str.length) {
    return {
      r: parseInt(str.slice(1, 3), 16),
      g: parseInt(str.slice(3, 5), 16),
      b: parseInt(str.slice(5, 7), 16),
      a: 1
    }
  }
}

/**
 * Parse #nnn
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function hex3(str) {
  if ('#' == str[0] && 4 == str.length) {
    return {
      r: parseInt(str[1] + str[1], 16),
      g: parseInt(str[2] + str[2], 16),
      b: parseInt(str[3] + str[3], 16),
      a: 1
    }
  }
}


},{"./colors":48}],50:[function(require,module,exports){

exports.parse = require('css-parse');
exports.stringify = require('css-stringify');

},{"css-parse":51,"css-stringify":52}],51:[function(require,module,exports){

module.exports = function(css, options){
  options = options || {};

  /**
   * Positional.
   */

  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    var start = { line: lineno, column: column };
    if (!options.position) return positionNoop;

    return function(node){
      node.position = {
        start: start,
        end: { line: lineno, column: column }
      };

      whitespace();
      return node;
    }
  }

  /**
   * Return `node`.
   */

  function positionNoop(node) {
    whitespace();
    return node;
  }

  /**
   * Error `msg`.
   */

  function error(msg) {
    var err = new Error(msg + ' near line ' + lineno + ':' + column);
    err.line = lineno;
    err.column = column;
    err.source = css;
    throw err;
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    return {
      type: 'stylesheet',
      stylesheet: {
        rules: rules()
      }
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments(rules);
    while (css[0] != '}' && (node = atrule() || rule())) {
      rules.push(node);
      comments(rules);
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) rules.push(c);
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    var pos = position();
    if ('/' != css[0] || '*' != css[1]) return;

    var i = 2;
    while (null != css[i] && ('*' != css[i] || '/' != css[i + 1])) ++i;
    i += 2;

    var str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    return m[0].trim().split(/\s*,\s*/);
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    var pos = position();

    // prop
    var prop = match(/^(\*?[-\w]+)\s*/);
    if (!prop) return;
    prop = prop[0];

    // :
    if (!match(/^:\s*/)) return error("property missing ':'");

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
    if (!val) return error('property missing value');

    var ret = pos({
      type: 'declaration',
      property: prop,
      value: val[0].trim()
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      comments(decls);
    }

    if (!close()) return error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];
    var pos = position();

    while (m = match(/^(from|to|\d+%|\.\d+%|\d+\.\d+%)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes */);

    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s*/);
    if (!m) return error("@keyframes missing name");
    var name = m[1];

    if (!open()) return error("@keyframes missing '{'");
    comments();

    var frame;
    var frames = [];
    while (frame = keyframe()) {
      frames.push(frame);
      comments();
    }

    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);

    if (!m) return;
    var supports = m[1].trim();

    if (!open()) return error("@supports missing '{'");
    comments();

    var style = rules();

    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);

    if (!m) return;
    var media = m[1].trim();

    if (!open()) return error("@media missing '{'");
    comments();

    var style = rules();

    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    var pos = position();
    var m = match(/^@page */);
    if (!m) return;

    var sel = selector() || [];
    var decls = [];

    if (!open()) return error("@page missing '{'");
    comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      comments();
    }

    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    var vendor = (m[1] || '').trim();
    var doc = m[2].trim();

    if (!open()) return error("@document missing '{'");
    comments();

    var style = rules();

    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    });
  }

  /**
   * Parse import
   */

  function atimport() {
    return _atrule('import');
  }

  /**
   * Parse charset
   */

  function atcharset() {
    return _atrule('charset');
  }

  /**
   * Parse namespace
   */

  function atnamespace() {
    return _atrule('namespace')
  }

  /**
   * Parse non-block at-rules
   */

  function _atrule(name) {
    var pos = position();
    var m = match(new RegExp('^@' + name + ' *([^;\\n]+);'));
    if (!m) return;
    var ret = { type: name };
    ret[name] = m[1].trim();
    return pos(ret);
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    return atkeyframes()
      || atmedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage();
  }

  /**
   * Parse rule.
   */

  function rule() {
    var pos = position();
    var sel = selector();

    if (!sel) return;
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    });
  }

  return stylesheet();
};


},{}],52:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Compressed = require('./lib/compress');
var Identity = require('./lib/identity');

/**
 * Stringfy the given AST `node`.
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  options = options || {};

  var compiler = options.compress
    ? new Compressed(options)
    : new Identity(options);

  return compiler.compile(node);
};


},{"./lib/compress":53,"./lib/identity":54}],53:[function(require,module,exports){

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
}

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return node.stylesheet
    .rules.map(this.visit, this)
    .join('');
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  if (this.compress) return '';
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return '@import ' + node.import + ';';
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return '@media '
    + node.media
    + '{'
    + node.rules.map(this.visit, this).join('')
    + '}';
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return doc
    + '{'
    + node.rules.map(this.visit, this).join('')
    + '}';
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return '@charset ' + node.charset + ';';
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return '@supports '
    + node.supports
    + ' {\n'
    + this.indent(1)
    + node.rules.map(this.visit, this).join('\n\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return '@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name
    + '{'
    + node.keyframes.map(this.visit, this).join('')
    + '}';
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return node.values.join(',')
    + '{'
    + decls.map(this.visit, this).join('')
    + '}';
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ') + ' '
    : '';

  return '@page ' + sel
    + '{\n'
    + this.indent(1)
    + node.declarations.map(this.visit, this).join('\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var decls = node.declarations;
  if (!decls.length) return '';

  return node.selectors.join(',')
    + '{'
    + decls.map(this.visit, this).join('')
    + '}';
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return node.property + ':' + node.value + ';';
};


},{}],54:[function(require,module,exports){

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  this.indentation = options.indent;
}

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return node.stylesheet
    .rules.map(this.visit, this)
    .join('\n\n');
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.indent() + '/*' + node.comment + '*/';
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return '@import ' + node.import + ';';
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return '@media '
    + node.media
    + ' {\n'
    + this.indent(1)
    + node.rules.map(this.visit, this).join('\n\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return doc + ' '
    + ' {\n'
    + this.indent(1)
    + node.rules.map(this.visit, this).join('\n\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return '@charset ' + node.charset + ';\n';
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return '@supports '
    + node.supports
    + ' {\n'
    + this.indent(1)
    + node.rules.map(this.visit, this).join('\n\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return '@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name
    + ' {\n'
    + this.indent(1)
    + node.keyframes.map(this.visit, this).join('\n')
    + this.indent(-1)
    + '}';
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.indent()
    + node.values.join(', ')
    + ' {\n'
    + this.indent(1)
    + decls.map(this.visit, this).join('\n')
    + this.indent(-1)
    + '\n' + this.indent() + '}\n';
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ') + ' '
    : '';

  return '@page ' + sel
    + '{\n'
    + this.indent(1)
    + node.declarations.map(this.visit, this).join('\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return node.selectors.map(function(s){ return indent + s }).join(',\n')
    + ' {\n'
    + this.indent(1)
    + decls.map(this.visit, this).join('\n')
    + this.indent(-1)
    + '\n' + this.indent() + '}';
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.indent() + node.property + ': ' + node.value + ';';
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join(this.indentation || '  ');
};

},{}],55:[function(require,module,exports){
(function(process,__dirname){var path = require('path');
var fs = require('fs');

function Mime() {
  // Map of extension -> mime type
  this.types = Object.create(null);

  // Map of mime type -> extension
  this.extensions = Object.create(null);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * @param map (Object) type definitions
 */
Mime.prototype.define = function (map) {
  for (var type in map) {
    var exts = map[type];

    for (var i = 0; i < exts.length; i++) {
      if (process.env.DEBUG_MIME && this.types[exts]) {
        console.warn(this._loading.replace(/.*\//, ''), 'changes "' + exts[i] + '" extension type from ' +
          this.types[exts] + ' to ' + type);
      }

      this.types[exts[i]] = type;
    }

    // Default extension is the first one we encounter
    if (!this.extensions[type]) {
      this.extensions[type] = exts[0];
    }
  }
};

/**
 * Load an Apache2-style ".types" file
 *
 * This may be called multiple times (it's expected).  Where files declare
 * overlapping types/extensions, the last file wins.
 *
 * @param file (String) path of file to load.
 */
Mime.prototype.load = function(file) {

  this._loading = file;
  // Read file and split into lines
  var map = {},
      content = fs.readFileSync(file, 'ascii'),
      lines = content.split(/[\r\n]+/);

  lines.forEach(function(line) {
    // Clean up whitespace/comments, and split into fields
    var fields = line.replace(/\s*#.*|^\s*|\s*$/g, '').split(/\s+/);
    map[fields.shift()] = fields;
  });

  this.define(map);

  this._loading = null;
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.lookup = function(path, fallback) {
  var ext = path.replace(/.*[\.\/]/, '').toLowerCase();

  return this.types[ext] || fallback || this.default_type;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.extension = function(mimeType) {
  return this.extensions[mimeType];
};

// Default instance
var mime = new Mime();

// Load local copy of
// http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
mime.load(path.join(__dirname, 'types/mime.types'));

// Load additional types from node.js community
mime.load(path.join(__dirname, 'types/node.types'));

// Default type
mime.default_type = mime.lookup('bin');

//
// Additional API specific to the default instance
//

mime.Mime = Mime;

/**
 * Lookup a charset based on mime type.
 */
mime.charsets = {
  lookup: function(mimeType, fallback) {
    // Assume text types are utf8
    return (/^text\//).test(mimeType) ? 'UTF-8' : fallback;
  }
};

module.exports = mime;

})(require("__browserify_process"),"/../node_modules/styl/node_modules/rework/node_modules/mime")
},{"__browserify_process":14,"fs":10,"path":11}],56:[function(require,module,exports){
exports = module.exports = function (options) {
  return function inherit(style) {
    return new Inherit(style, options || {})
  }
}

exports.Inherit = Inherit

exports.debug = require('debug')('rework-inherit')

function Inherit(style, options) {
  if (!(this instanceof Inherit))
    return new Inherit(style, options);

  options = options || {}

  this.propertyRegExp = options.propertyRegExp
    || /^(inherit|extend)s?$/i

  var rules = this.rules = style.rules
  this.matches = {}

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i]
    if (rule.rules) {
      // Media queries
      this.inheritMedia(rule)
      if (!rule.rules.length) rules.splice(i--, 1);
    } else if (rule.selectors) {
      // Regular rules
      this.inheritRules(rule)
      if (!rule.declarations.length) rules.splice(i--, 1);
    }
  }

  this.removePlaceholders()
}

Inherit.prototype.inheritMedia = function (mediaRule) {
  var rules = mediaRule.rules
  var query = mediaRule.media

  for (var i = 0; i < rules.length; i++) {
    var rule = rules[i]
    if (!rule.selectors) continue;

    var additionalRules = this.inheritMediaRules(rule, query)

    if (!rule.declarations.length) rules.splice(i--, 1);

    // I don't remember why I'm using apply here.
    ;[].splice.apply(rules, [i, 0].concat(additionalRules))
    i += additionalRules.length
  }
}

Inherit.prototype.inheritMediaRules = function (rule, query) {
  var declarations = rule.declarations
  var selectors = rule.selectors
  var appendRules = []

  for (var i = 0; i < declarations.length; i++) {
    var decl = declarations[i]
    // Could be comments
    if (decl.type !== 'declaration') continue;
    if (!this.propertyRegExp.test(decl.property)) continue;

    decl.value.split(',').map(trim).forEach(function (val) {
      // Should probably just use concat here
      ;[].push.apply(appendRules, this.inheritMediaRule(val, selectors, query));
    }, this)

    declarations.splice(i--, 1)
  }

  return appendRules
}

Inherit.prototype.inheritMediaRule = function (val, selectors, query) {
  var matchedRules = this.matches[val] || this.matchRules(val)
  var alreadyMatched = matchedRules.media[query]
  var matchedQueryRules = alreadyMatched || this.matchQueryRule(val, query)

  if (!matchedQueryRules.rules.length)
    throw new Error('Failed to extend as media query from ' + val + '.');

  exports.debug('extend %j in @media %j with %j', selectors, query, val);

  this.appendSelectors(matchedQueryRules, val, selectors)

  return alreadyMatched
    ? []
    : matchedQueryRules.rules.map(getRule)
}

Inherit.prototype.inheritRules = function (rule) {
  var declarations = rule.declarations
  var selectors = rule.selectors

  for (var i = 0; i < declarations.length; i++) {
    var decl = declarations[i]
    // Could be comments
    if (decl.type !== 'declaration') continue;
    if (!this.propertyRegExp.test(decl.property)) continue;

    decl.value.split(',').map(trim).forEach(function (val) {
      this.inheritRule(val, selectors)
    }, this)

    declarations.splice(i--, 1)
  }
}

Inherit.prototype.inheritRule = function (val, selectors) {
  var matchedRules = this.matches[val] || this.matchRules(val)

  if (!matchedRules.rules.length)
    throw new Error('Failed to extend from ' + val + '.');

  exports.debug('extend %j with %j', selectors, val);

  this.appendSelectors(matchedRules, val, selectors)
}

Inherit.prototype.matchQueryRule = function (val, query) {
  var matchedRules = this.matches[val] || this.matchRules(val)

  return matchedRules.media[query] = {
    media: query,
    rules: matchedRules.rules.map(function (rule) {
      return {
        selectors: rule.selectors,
        declarations: rule.declarations,
        rule: {
          type: 'rule',
          selectors: [],
          declarations: rule.declarations
        }
      }
    })
  }
}

Inherit.prototype.matchRules = function (val) {
  var matchedRules = this.matches[val] = {
    rules: [],
    media: {}
  }

  this.rules.forEach(function (rule) {
    if (!rule.selectors) return;

    var matchedSelectors = rule.selectors.filter(function (selector) {
      return selector.match(replaceRegExp(val))
    })

    if (!matchedSelectors.length) return;

    matchedRules.rules.push({
      selectors: matchedSelectors,
      declarations: rule.declarations,
      rule: rule
    })
  })

  return matchedRules
}

Inherit.prototype.appendSelectors = function (matchedRules, val, selectors) {
  matchedRules.rules.forEach(function (matchedRule) {
    // Selector to actually inherit
    var selectorReference = matchedRule.rule.selectors

    matchedRule.selectors.forEach(function (matchedSelector) {
      ;[].push.apply(selectorReference, selectors.map(function (selector) {
        return replaceSelector(matchedSelector, val, selector)
      }))
    })
  })
}

// Placeholders are not allowed in media queries
Inherit.prototype.removePlaceholders = function () {
  var rules = this.rules

  for (var i = 0; i < rules.length; i++) {
    var selectors = rules[i].selectors
    if (!selectors) continue;

    for (var j = 0; j < selectors.length; j++) {
      var selector = selectors[j]
      if (~selector.indexOf('%')) selectors.splice(j--, 1);
    }

    if (!selectors.length) rules.splice(i--, 1);
  }
}

function replaceSelector(matchedSelector, val, selector) {
  return matchedSelector.replace(replaceRegExp(val), function (_, first, last) {
    return first + selector + last
  })
}

function replaceRegExp(val) {
  return new RegExp(
    '(^|\\s|\\>|\\+|~)' +
    escapeRegExp(val) +
    '($|\\s|\\>|\\+|~|\\:)'
    , 'g'
  )
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
}

function trim(x) {
  return x.trim()
}

function getRule(x) {
  return x.rule
}

},{"debug":20}],57:[function(require,module,exports){

/**
 * Expose `visit()`.
 */

module.exports = visit;

/**
 * Visit `node`'s declarations recursively and
 * invoke `fn(declarations, node)`.
 *
 * @param {Object} node
 * @param {Function} fn
 * @api private
 */

function visit(node, fn){
  node.rules.forEach(function(rule){
    // @media etc
    if (rule.rules) {
      visit(rule, fn);
      return;
    }

    // keyframes
    if (rule.keyframes) {
      rule.keyframes.forEach(function(keyframe){
        fn(keyframe.declarations, rule);
      });
      return;
    }

    // @charset, @import etc
    if (!rule.declarations) return;

    fn(rule.declarations, node);
  });
};

},{}],58:[function(require,module,exports){
!function(){var Model,Observable,className,__slice=[].slice;require("cornerstone-js");Observable=require("./observable");className=function(string){return string.charAt(0).toUpperCase()+string.substring(1)};Model=function(I){var self;self=Core(I).extend({attrObservable:function(){var names;names=1<=arguments.length?__slice.call(arguments,0):[];return names.each(function(name){self[name]=Observable(I[name]);return self[name].observe(function(newValue){return I[name]=newValue})})},attrModel:function(name,Model){var model;if(Model==null){Model=className(name).constantize()}model=Model(I[name]);self[name]=Observable(model);return self[name].observe(function(newValue){return I[name]=newValue.I})},attrModels:function(name,Model){var models;if(Model==null){Model=className(name).constantize()}models=(I[name]||[]).map(Model);self[name]=Observable(models);return self[name].observe(function(newValue){return I[name]=newValue.map(function(instance){return instance.I})})},toJSON:function(){return I}});return self};module.exports=Model}.call(this);
},{"./observable":59,"cornerstone-js":61}],59:[function(require,module,exports){
!function(){var Observable,__slice=[].slice;require("cornerstone-js");Observable=function(value){var listeners,notify,self;listeners=[];notify=function(newValue){return listeners.each(function(listener){return listener(newValue)})};self=function(newValue){if(arguments.length>0){if(value!==newValue){value=newValue;notify(newValue)}}return value};Object.extend(self,{observe:function(listener){return listeners.push(listener)},each:function(){var args,_ref;args=1<=arguments.length?__slice.call(arguments,0):[];if(value!=null){return(_ref=[value]).each.apply(_ref,args)}}});if(Array.isArray(value)){Object.extend(self,{each:function(){var args;args=1<=arguments.length?__slice.call(arguments,0):[];return value.each.apply(value,args)},map:function(){var args;args=1<=arguments.length?__slice.call(arguments,0):[];return value.map.apply(value,args)},remove:function(item){var ret;ret=value.remove(item);notify(value);return ret},push:function(item){var ret;ret=value.push(item);notify(value);return ret},pop:function(){var ret;ret=value.pop();notify(value);return ret}})}return self};Observable.lift=function(object){var dummy,value;if(typeof object.observe==="function"){return object}else if(typeof object==="function"){value=object()}else{value=object}dummy=function(newValue){if(arguments.length>0){return value=newValue}else{return value}};dummy.observe=function(){};Object.extend(dummy,{each:function(){var args,_ref;args=1<=arguments.length?__slice.call(arguments,0):[];if(value!=null){return(_ref=[].concat(value)).forEach.apply(_ref,args)}},map:function(){var args,_ref;args=1<=arguments.length?__slice.call(arguments,0):[];if(value!=null){return(_ref=[].concat(value)).map.apply(_ref,args)}}});return dummy};module.exports=Observable}.call(this);
},{"cornerstone-js":61}],60:[function(require,module,exports){
!function(){module.exports={Model:require("./model"),Observable:require("./observable")}}.call(this);
},{"./model":58,"./observable":59}],61:[function(require,module,exports){
(function(global){!function(){var Bindable,__slice=[].slice;Object.isArray=function(object){return Object.prototype.toString.call(object)==="[object Array]"};Object.isString=function(object){return Object.prototype.toString.call(object)==="[object String]"};Object.defaults=Object.reverseMerge=function(){var name,object,objects,target,_i,_len;target=arguments[0],objects=2<=arguments.length?__slice.call(arguments,1):[];for(_i=0,_len=objects.length;_i<_len;_i++){object=objects[_i];for(name in object){if(!target.hasOwnProperty(name)){target[name]=object[name]}}}return target};Object.extend=function(){var name,source,sources,target,_i,_len;target=arguments[0],sources=2<=arguments.length?__slice.call(arguments,1):[];for(_i=0,_len=sources.length;_i<_len;_i++){source=sources[_i];for(name in source){target[name]=source[name]}}return target};Object.isObject=function(object){return Object.prototype.toString.call(object)==="[object Object]"};Object.extend(Array.prototype,{average:function(){return this.sum()/this.length},compact:function(){return this.select(function(element){return element!=null})},copy:function(){return this.concat()},clear:function(){this.length=0;return this},flatten:function(){return this.inject([],function(a,b){return a.concat(b)})},invoke:function(){var args,method;method=arguments[0],args=2<=arguments.length?__slice.call(arguments,1):[];return this.map(function(element){return element[method].apply(element,args)})},rand:function(){return this[rand(this.length)]},remove:function(object){var index;index=this.indexOf(object);if(index>=0){return this.splice(index,1)[0]}else{return void 0}},include:function(element){return this.indexOf(element)!==-1},each:function(iterator,context){var element,i,_i,_len;if(this.forEach){this.forEach(iterator,context)}else{for(i=_i=0,_len=this.length;_i<_len;i=++_i){element=this[i];iterator.call(context,element,i,this)}}return this},eachPair:function(iterator,context){var a,b,i,j,length,_results;length=this.length;i=0;_results=[];while(i<length){a=this[i];j=i+1;i+=1;_results.push(function(){var _results1;_results1=[];while(j<length){b=this[j];j+=1;_results1.push(iterator.call(context,a,b))}return _results1}.call(this))}return _results},eachWithObject:function(object,iterator,context){this.each(function(element,i,self){return iterator.call(context,element,object,i,self)});return object},eachSlice:function(n,iterator,context){var i,len;if(n>0){len=(this.length/n).floor();i=-1;while(++i<len){iterator.call(context,this.slice(i*n,(i+1)*n),i*n,this)}}return this},pipeline:function(input){return this.inject(input,function(input,fn){return fn(input)})},shuffle:function(){var shuffledArray;shuffledArray=[];this.each(function(element){return shuffledArray.splice(rand(shuffledArray.length+1),0,element)});return shuffledArray},first:function(){return this[0]},last:function(){return this[this.length-1]},extremes:function(fn){var max,maxResult,min,minResult;if(fn==null){fn=Function.identity}min=max=void 0;minResult=maxResult=void 0;this.each(function(object){var result;result=fn(object);if(min!=null){if(result<minResult){min=object;minResult=result}}else{min=object;minResult=result}if(max!=null){if(result>maxResult){max=object;return maxResult=result}}else{max=object;return maxResult=result}});return{min:min,max:max}},maxima:function(valueFunction){if(valueFunction==null){valueFunction=Function.identity}return this.inject([-Infinity,[]],function(memo,item){var maxItems,maxValue,value;value=valueFunction(item);maxValue=memo[0],maxItems=memo[1];if(value>maxValue){return[value,[item]]}else if(value===maxValue){return[value,maxItems.concat(item)]}else{return memo}}).last()},maximum:function(valueFunction){return this.maxima(valueFunction).first()},minima:function(valueFunction){var inverseFn;if(valueFunction==null){valueFunction=Function.identity}inverseFn=function(x){return-valueFunction(x)};return this.maxima(inverseFn)},minimum:function(valueFunction){return this.minima(valueFunction).first()},wrap:function(start,length){var end,i,result;if(length!=null){end=start+length;i=start;result=[];while(i<end){result.push(this[i.mod(this.length)]);i+=1}return result}else{return this[start.mod(this.length)]}},partition:function(iterator,context){var falseCollection,trueCollection;trueCollection=[];falseCollection=[];this.each(function(element){if(iterator.call(context,element)){return trueCollection.push(element)}else{return falseCollection.push(element)}});return[trueCollection,falseCollection]},select:function(iterator,context){return this.partition(iterator,context)[0]},without:function(values){return this.reject(function(element){return values.include(element)})},reject:function(iterator,context){return this.partition(iterator,context)[1]},inject:function(initial,iterator){this.each(function(element){return initial=iterator(initial,element)});return initial},sum:function(){return this.inject(0,function(sum,n){return sum+n})},product:function(){return this.inject(1,function(product,n){return product*n})},zip:function(){var args;args=1<=arguments.length?__slice.call(arguments,0):[];return this.map(function(element,index){var output;output=args.map(function(arr){return arr[index]});output.unshift(element);return output})}});Bindable=function(I,self){var eventCallbacks;if(I==null){I={}}eventCallbacks={};return{bind:function(){var args;args=1<=arguments.length?__slice.call(arguments,0):[];return self.on.apply(self,args)},unbind:function(){var args;args=1<=arguments.length?__slice.call(arguments,0):[];return self.off.apply(self,args)},on:function(namespacedEvent,callback){var event,namespace,_ref;_ref=namespacedEvent.split("."),event=_ref[0],namespace=_ref[1];if(namespace){callback.__PIXIE||(callback.__PIXIE={});callback.__PIXIE[namespace]=true}eventCallbacks[event]||(eventCallbacks[event]=[]);eventCallbacks[event].push(callback);return this},off:function(namespacedEvent,callback){var callbacks,event,key,namespace,_ref;_ref=namespacedEvent.split("."),event=_ref[0],namespace=_ref[1];if(event){eventCallbacks[event]||(eventCallbacks[event]=[]);if(namespace){eventCallbacks[event]=eventCallbacks.select(function(callback){var _ref1;return((_ref1=callback.__PIXIE)!=null?_ref1[namespace]:void 0)==null})}else{if(callback){eventCallbacks[event].remove(callback)}else{eventCallbacks[event]=[]}}}else if(namespace){for(key in eventCallbacks){callbacks=eventCallbacks[key];eventCallbacks[key]=callbacks.select(function(callback){var _ref1;return((_ref1=callback.__PIXIE)!=null?_ref1[namespace]:void 0)==null})}}return this},trigger:function(){var callbacks,event,parameters;event=arguments[0],parameters=2<=arguments.length?__slice.call(arguments,1):[];callbacks=eventCallbacks[event];if(callbacks&&callbacks.length){self=this;return callbacks.each(function(callback){return callback.apply(self,parameters)})}}}};(typeof global!=="undefined"&&global!==null?global:this)["Bindable"]=Bindable;!function(){var root;root=typeof global!=="undefined"&&global!==null?global:window;return root.Core=function(I){var Module,moduleName,self,_i,_len,_ref;if(I==null){I={}}Object.reverseMerge(I,{includedModules:[]});self={I:I,attrAccessor:function(){var attrNames;attrNames=1<=arguments.length?__slice.call(arguments,0):[];return attrNames.each(function(attrName){return self[attrName]=function(newValue){if(newValue!=null){I[attrName]=newValue;return self}else{return I[attrName]}}})},attrReader:function(){var attrNames;attrNames=1<=arguments.length?__slice.call(arguments,0):[];return attrNames.each(function(attrName){return self[attrName]=function(){return I[attrName]}})},extend:function(options){Object.extend(self,options);return self},include:function(){var Module,key,moduleName,modules,value,_i,_len;modules=1<=arguments.length?__slice.call(arguments,0):[];for(_i=0,_len=modules.length;_i<_len;_i++){Module=modules[_i];if(typeof Module.isString==="function"?Module.isString():void 0){moduleName=Module;Module=Module.constantize()}else if(moduleName=Module._name){}else{for(key in root){value=root[key];if(value===Module){Module._name=moduleName=key}}}if(moduleName){if(!I.includedModules.include(moduleName)){I.includedModules.push(moduleName);self.extend(Module(I,self))}}else{warn("Unable to discover name for module: ",Module,"\nSerialization issues may occur.");self.extend(Module(I,self))}}return self},send:function(){var args,name;name=arguments[0],args=2<=arguments.length?__slice.call(arguments,1):[];return self[name].apply(self,args)}};self.include("Bindable");_ref=I.includedModules;for(_i=0,_len=_ref.length;_i<_len;_i++){moduleName=_ref[_i];Module=moduleName.constantize();self.extend(Module(I,self))}return self}}();Object.extend(Function.prototype,{once:function(){var func,memo,ran;func=this;ran=false;memo=void 0;return function(){if(ran){return memo}ran=true;return memo=func.apply(this,arguments)}},debounce:function(wait){var func,timeout;timeout=null;func=this;return function(){var args,context,later;context=this;args=arguments;later=function(){timeout=null;return func.apply(context,args)};clearTimeout(timeout);return timeout=setTimeout(later,wait)}},delay:function(){var args,func,wait;wait=arguments[0],args=2<=arguments.length?__slice.call(arguments,1):[];func=this;return setTimeout(function(){return func.apply(null,args)},wait)},defer:function(){var args;args=1<=arguments.length?__slice.call(arguments,0):[];return this.delay.apply(this,[1].concat(args))}});Object.extend(Function,{identity:function(x){return x},noop:function(){}});!function(){var Matrix;Matrix=function(a,b,c,d,tx,ty){var _ref;if(Object.isObject(a)){_ref=a,a=_ref.a,b=_ref.b,c=_ref.c,d=_ref.d,tx=_ref.tx,ty=_ref.ty}return{__proto__:Matrix.prototype,a:a!=null?a:1,b:b||0,c:c||0,d:d!=null?d:1,tx:tx||0,ty:ty||0}};Matrix.prototype={concat:function(matrix){return Matrix(this.a*matrix.a+this.c*matrix.b,this.b*matrix.a+this.d*matrix.b,this.a*matrix.c+this.c*matrix.d,this.b*matrix.c+this.d*matrix.d,this.a*matrix.tx+this.c*matrix.ty+this.tx,this.b*matrix.tx+this.d*matrix.ty+this.ty)},copy:function(){return Matrix(this.a,this.b,this.c,this.d,this.tx,this.ty)},deltaTransformPoint:function(point){return Point(this.a*point.x+this.c*point.y,this.b*point.x+this.d*point.y)},inverse:function(){var determinant;determinant=this.a*this.d-this.b*this.c;return Matrix(this.d/determinant,-this.b/determinant,-this.c/determinant,this.a/determinant,(this.c*this.ty-this.d*this.tx)/determinant,(this.b*this.tx-this.a*this.ty)/determinant)},rotate:function(theta,aboutPoint){return this.concat(Matrix.rotation(theta,aboutPoint))},scale:function(sx,sy,aboutPoint){return this.concat(Matrix.scale(sx,sy,aboutPoint))},skew:function(skewX,skewY){return this.concat(Matrix.skew(skewX,skewY))},toString:function(){return"Matrix("+this.a+", "+this.b+", "+this.c+", "+this.d+", "+this.tx+", "+this.ty+")"},transformPoint:function(point){return Point(this.a*point.x+this.c*point.y+this.tx,this.b*point.x+this.d*point.y+this.ty)},translate:function(tx,ty){return this.concat(Matrix.translation(tx,ty))}};Matrix.rotate=Matrix.rotation=function(theta,aboutPoint){var rotationMatrix;rotationMatrix=Matrix(Math.cos(theta),Math.sin(theta),-Math.sin(theta),Math.cos(theta));if(aboutPoint!=null){rotationMatrix=Matrix.translation(aboutPoint.x,aboutPoint.y).concat(rotationMatrix).concat(Matrix.translation(-aboutPoint.x,-aboutPoint.y))}return rotationMatrix};Matrix.scale=function(sx,sy,aboutPoint){var scaleMatrix;sy=sy||sx;scaleMatrix=Matrix(sx,0,0,sy);if(aboutPoint){scaleMatrix=Matrix.translation(aboutPoint.x,aboutPoint.y).concat(scaleMatrix).concat(Matrix.translation(-aboutPoint.x,-aboutPoint.y))}return scaleMatrix};Matrix.skew=function(skewX,skewY){return Matrix(0,Math.tan(skewY),Math.tan(skewX),0)};Matrix.translate=Matrix.translation=function(tx,ty){return Matrix(1,0,0,1,tx,ty)};Matrix.IDENTITY=Matrix();Matrix.HORIZONTAL_FLIP=Matrix(-1,0,0,1);Matrix.VERTICAL_FLIP=Matrix(1,0,0,-1);if(Object.freeze){Object.freeze(Matrix.IDENTITY);Object.freeze(Matrix.HORIZONTAL_FLIP);Object.freeze(Matrix.VERTICAL_FLIP)}return this["Matrix"]=Matrix}();["abs","ceil","floor","round"].each(function(method){return Number.prototype[method]=function(){return Math[method](this)}});Object.extend(Number.prototype,{circularPoints:function(block){var n;n=this;return n.times(function(i){return block(Point.fromAngle((i/n).turns),i)})},clamp:function(min,max){if(min!=null&&max!=null){return Math.min(Math.max(this,min),max)}else if(min!=null){return Math.max(this,min)}else if(max!=null){return Math.min(this,max)}else{return this}},mod:function(base){var result;result=this%base;if(result<0&&base>0){result+=base}return result},sign:function(){if(this>0){return 1}else if(this<0){return-1}else{return 0}},even:function(){return this.mod(2)===0},odd:function(){return this.mod(2)===1},times:function(iterator,context){var i;i=-1;while(++i<this){iterator.call(context,i)}return i},snap:function(resolution){var n;n=this/resolution;1/1;return n.floor()*resolution},primeFactors:function(){var factors,i,iSquared,n;factors=[];n=this.floor();if(n===0){return void 0}if(n<0){factors.push(-1);n/=-1}i=2;iSquared=i*i;while(iSquared<n){while(n%i===0){factors.push(i);n/=i}i+=1;iSquared=i*i}if(n!==1){factors.push(n)}return factors},toColorPart:function(){var s;s=parseInt(this.clamp(0,255),10).toString(16);if(s.length===1){s="0"+s}return s},approach:function(target,maxDelta){return(target-this).clamp(-maxDelta,maxDelta)+this},approachByRatio:function(target,ratio){return this.approach(target,this*ratio)},approachRotation:function(target,maxDelta){while(target>this+Math.PI){target-=Math.TAU}while(target<this-Math.PI){target+=Math.TAU}return(target-this).clamp(-maxDelta,maxDelta)+this},constrainRotation:function(){var target;target=this;while(target>Math.PI){target-=Math.TAU}while(target<-Math.PI){target+=Math.TAU}return target},truncate:function(){if(this>0){return this.floor()}else if(this<0){return this.ceil()}else{return this}},d:function(sides){var sum;sum=0;this.times(function(){return sum+=rand(sides)+1});return sum}});if(!5..seconds){Object.defineProperty(Number.prototype,"seconds",{get:function(){return this*1e3}})}if(!1..second){Object.defineProperty(Number.prototype,"second",{get:function(){return this*1e3}})}if(!5..rotations){Object.defineProperty(Number.prototype,"rotations",{get:function(){return this*Math.TAU}})}if(!1..rotation){Object.defineProperty(Number.prototype,"rotation",{get:function(){return this*Math.TAU}})}if(!5..turns){Object.defineProperty(Number.prototype,"turns",{get:function(){return this*Math.TAU}})}if(!1..turn){Object.defineProperty(Number.prototype,"turn",{get:function(){return this*Math.TAU}})}if(!2..degrees){Object.defineProperty(Number.prototype,"degrees",{get:function(){return this*Math.TAU/360}})}if(!1..degree){Object.defineProperty(Number.prototype,"degree",{get:function(){return this*Math.TAU/360}})}Math.TAU=2*Math.PI;!function(){var Point;Point=function(x,y){var _ref;if(Object.isObject(x)){_ref=x,x=_ref.x,y=_ref.y}return{__proto__:Point.prototype,x:x||0,y:y||0}};Point.prototype={clamp:function(n){return this.copy().clamp$(n)},clamp$:function(n){if(this.magnitude()>n){return this.norm$(n)}else{return this}},copy:function(){return Point(this.x,this.y)},add:function(first,second){return this.copy().add$(first,second)},add$:function(first,second){if(second!=null){this.x+=first;this.y+=second}else{this.x+=first.x;this.y+=first.y}return this},subtract:function(first,second){return this.copy().subtract$(first,second)},subtract$:function(first,second){if(second!=null){this.x-=first;this.y-=second}else{this.x-=first.x;this.y-=first.y}return this},scale:function(scalar){return this.copy().scale$(scalar)},scale$:function(scalar){this.x*=scalar;this.y*=scalar;return this},norm:function(length){if(length==null){length=1}return this.copy().norm$(length)},norm$:function(length){var m;if(length==null){length=1}if(m=this.length()){return this.scale$(length/m)}else{return this}},equal:function(other){return this.x===other.x&&this.y===other.y},length:function(){return Math.sqrt(this.dot(this))},magnitude:function(){return this.length()},direction:function(){return Math.atan2(this.y,this.x)},dot:function(other){return this.x*other.x+this.y*other.y},cross:function(other){return this.x*other.y-other.x*this.y},distance:function(other){return Point.distance(this,other)},toString:function(){return"Point("+this.x+", "+this.y+")"},snap:function(n){return Point({x:this.x.snap(n),y:this.y.snap(n)})},angle:function(){return Math.atan2(this.y,this.x)}};"abs\nceil\nfloor\ntruncate".split("\n").each(function(method){return Point.prototype[method]=function(){return Point({x:this.x[method](),y:this.y[method]()})}});Point.distance=function(p1,p2){return Math.sqrt(Point.distanceSquared(p1,p2))};Point.distanceSquared=function(p1,p2){return Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2)};Point.interpolate=function(p1,p2,t){return p2.subtract(p1).scale(t).add(p1)};Point.fromAngle=function(angle){return Point(Math.cos(angle),Math.sin(angle))};Point.direction=function(p1,p2){return Math.atan2(p2.y-p1.y,p2.x-p1.x)};Point.centroid=function(){var points;points=1<=arguments.length?__slice.call(arguments,0):[];return points.inject(Point(0,0),function(sumPoint,point){return sumPoint.add(point)}).scale(1/points.length)};Point.random=function(){return Point.fromAngle(Random.angle())};Point.ZERO=Point(0,0);Point.LEFT=Point(-1,0);Point.RIGHT=Point(1,0);Point.UP=Point(0,-1);Point.DOWN=Point(0,1);if(Object.freeze){Object.freeze(Point.ZERO);Object.freeze(Point.LEFT);Object.freeze(Point.RIGHT);Object.freeze(Point.UP);Object.freeze(Point.DOWN)}return(typeof global!=="undefined"&&global!==null?global:this)["Point"]=Point}();!function(){var root;root=typeof global!=="undefined"&&global!==null?global:window;root["Random"]={angle:function(){return rand()*Math.TAU},angleBetween:function(min,max){return rand()*(max-min)+min},color:function(){return Color.random()}};root["rand"]=function(n){if(n){return Math.floor(n*Math.random())}else{return Math.random()}};return root["signedRand"]=function(n){if(n){return n*Math.random()-n/2}else{return Math.random()-.5}}}();!function(){var Rectangle;Rectangle=function(_arg){var height,width,x,y;x=_arg.x,y=_arg.y,width=_arg.width,height=_arg.height;return{__proto__:Rectangle.prototype,x:x||0,y:y||0,width:width||0,height:height||0}};Rectangle.prototype={center:function(){return Point(this.x+this.width/2,this.y+this.height/2)},equal:function(other){return this.x===other.x&&this.y===other.y&&this.width===other.width&&this.height===other.height}};Rectangle.prototype.__defineGetter__("left",function(){return this.x});Rectangle.prototype.__defineGetter__("right",function(){return this.x+this.width});Rectangle.prototype.__defineGetter__("top",function(){return this.y});Rectangle.prototype.__defineGetter__("bottom",function(){return this.y+this.height});return this["Rectangle"]=Rectangle}();Object.extend(String.prototype,{blank:function(){return/^\s*$/.test(this)},camelize:function(){return this.trim().replace(/(\-|_|\s)+(.)?/g,function(match,separator,chr){if(chr){return chr.toUpperCase()}else{return""}})},capitalize:function(){return this.charAt(0).toUpperCase()+this.substring(1).toLowerCase()},constantize:function(){var item,target,_i,_len,_ref;target=typeof global!=="undefined"&&global!==null?global:window;_ref=this.split(".");for(_i=0,_len=_ref.length;_i<_len;_i++){item=_ref[_i];target=target[item]}return target},extension:function(){var extension,_ref;if(extension=(_ref=this.match(/\.([^\.]*)$/,""))!=null?_ref.last():void 0){return extension}else{return""}},humanize:function(){return this.replace(/_id$/,"").replace(/_/g," ").capitalize()},isString:function(){return true},parse:function(){var e;try{return JSON.parse(this.toString())}catch(_error){e=_error;return this.toString()}},startsWith:function(str){return this.lastIndexOf(str,0)===0},titleize:function(){return this.split(/[- ]/).map(function(word){return word.capitalize()}).join(" ")},underscore:function(){return this.replace(/([A-Z]+)([A-Z][a-z])/g,"$1_$2").replace(/([a-z\d])([A-Z])/g,"$1_$2").replace(/-/g,"_").toLowerCase()},withoutExtension:function(){return this.replace(/\.[^\.]*$/,"")},toInt:function(base){if(base==null){base=10}return parseInt(this,base)},parseHex:function(){var alpha,hexString,i,rgb;hexString=this.replace(/#/,"");switch(hexString.length){case 3:case 4:if(hexString.length===4){alpha=parseInt(hexString.substr(3,1),16)*17/255}else{alpha=1}rgb=function(){var _i,_results;_results=[];for(i=_i=0;_i<=2;i=++_i){_results.push(parseInt(hexString.substr(i,1),16)*17)}return _results}();rgb.push(alpha);return rgb;case 6:case 8:if(hexString.length===8){alpha=parseInt(hexString.substr(6,2),16)/255}else{alpha=1}rgb=function(){var _i,_results;_results=[];for(i=_i=0;_i<=2;i=++_i){_results.push(parseInt(hexString.substr(2*i,2),16))}return _results}();rgb.push(alpha);return rgb;default:return void 0}}})}.call(this);
})(self)
},{}]},{},[1])
;