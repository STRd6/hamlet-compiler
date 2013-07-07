(function() {
  var create, extend, grammar, o, oldParse, operators, parser, _ref,
    __slice = [].slice;

  _ref = require("./grammar_dsl"), o = _ref.node, create = _ref.create;

  grammar = {
    root: [
      o("lines", function() {
        return yy.nodePath[0].children;
      })
    ],
    lines: [o("lines line"), o("line")],
    indentation: [
      o("", function() {
        return 0;
      }), o("indentationLevel")
    ],
    indentationLevel: [
      o("indentationLevel INDENT", function() {
        return $1 + 1;
      }), o("INDENT", function() {
        return 1;
      })
    ],
    line: [
      o("DOCTYPE end", function() {
        return "doctype";
      }), o("indentation lineMain end", function() {
        return yy.append($lineMain, $indentation);
      }), o("end", function() {
        if ($end.newline) {
          return yy.newline();
        }
      })
    ],
    lineMain: [
      o("tag rest", function() {
        return yy.extend($tag, $rest);
      }), o("tag", function() {
        return $tag;
      }), o("rest", function() {
        return $rest;
      }), o("COMMENT", function() {
        return {
          comment: $1
        };
      }), o("FILTER", function() {
        return {
          filter: $1
        };
      }), o("FILTER_LINE", function() {
        return {
          filterLine: $1
        };
      })
    ],
    end: [
      o("NEWLINE", function() {
        return {
          newline: true
        };
      }), o("EOF")
    ],
    tag: [
      o("name tagComponents", function() {
        $tagComponents.tag = $name;
        return $tagComponents;
      }), o("name attributes", function() {
        return {
          tag: $name,
          attributes: $attributes
        };
      }), o("name", function() {
        return {
          tag: $name
        };
      }), o("tagComponents", function() {
        return yy.extend($tagComponents, {
          tag: "div"
        });
      })
    ],
    tagComponents: [
      o("idComponent classComponents attributes", function() {
        return {
          id: $idComponent,
          classes: $classComponents,
          attributes: $attributes
        };
      }), o("idComponent attributes", function() {
        return {
          id: $idComponent,
          attributes: $attributes
        };
      }), o("classComponents attributes", function() {
        return {
          classes: $classComponents,
          attributes: $attributes
        };
      }), o("idComponent classComponents", function() {
        return {
          id: $idComponent,
          classes: $classComponents
        };
      }), o("idComponent", function() {
        return {
          id: $idComponent
        };
      }), o("classComponents", function() {
        return {
          classes: $classComponents
        };
      })
    ],
    idComponent: [o("ID")],
    classComponents: [
      o("classComponents CLASS", function() {
        return $1.concat($2);
      }), o("CLASS", function() {
        return [$1];
      })
    ],
    attributes: [
      o("LEFT_PARENTHESIS attributePairs RIGHT_PARENTHESIS", function() {
        return $2;
      }), o("LEFT_BRACE attributePairs RIGHT_BRACE", function() {
        return $2;
      })
    ],
    attributePairs: [
      o("attributePairs SEPARATOR attributePair", function() {
        return $attributePairs.concat($attributePair);
      }), o("attributePair", function() {
        return [$attributePair];
      })
    ],
    attributePair: [
      o("ATTRIBUTE EQUAL ATTRIBUTE_VALUE", function() {
        return {
          name: $1,
          value: $3
        };
      })
    ],
    name: [o("TAG")],
    rest: [
      o("EQUAL CODE", function() {
        return {
          bufferedCode: $CODE
        };
      }), o("HYPHEN CODE", function() {
        return {
          unbufferedCode: $CODE
        };
      }), o("text", function() {
        return {
          text: $text
        };
      })
    ],
    text: [
      o("beginText TEXT", function() {
        return $2;
      }), o("TEXT")
    ],
    beginText: [
      o("WHITESPACE", function() {
        return yy.lexer.begin('text');
      })
    ]
  };

  operators = [];

  parser = create({
    grammar: grammar,
    operators: operators,
    startSymbol: "root"
  });

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

  exports.parser = parser;

}).call(this);
