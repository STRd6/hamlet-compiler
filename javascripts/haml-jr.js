(function() {
  var extend, lexer, oldParse, parser,
    __slice = [].slice;

  parser = require("./parser").parser;

  lexer = require("./lexer").lexer;

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

  exports.parser = parser;

}).call(this);
