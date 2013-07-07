(function() {
  var CoffeeScript, indentText, keywords, keywordsRegex, selfClosing, styl, util,
    __slice = [].slice;

  CoffeeScript = require("coffee-script");

  styl = require('styl');

  selfClosing = {
    area: true,
    base: true,
    br: true,
    col: true,
    hr: true,
    img: true,
    input: true,
    link: true,
    meta: true,
    param: true
  };

  indentText = function(text, indent) {
    if (indent == null) {
      indent = "  ";
    }
    return indent + text.replace(/\n/g, "\n" + indent);
  };

  keywords = ["on", "each", "with"];

  keywordsRegex = RegExp("\\s*(" + (keywords.join('|')) + ")\\s+");

  util = {
    selfClosing: selfClosing,
    indent: indentText,
    filters: {
      styl: function(content, compiler) {
        return compiler.styleTag(styl(content, {
          whitespace: true
        }).toString());
      },
      stet: function(content, compiler) {
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
        return "__observeAttribute __element, " + name + ", " + value + "\n__element.setAttribute " + name + ", " + value;
      });
      return lines = ["__element = document.createElement(" + (JSON.stringify(tag)) + ")", "__push(__element)"].concat(__slice.call(attributeLines), __slice.call(contents), ["__pop()"]);
    },
    buffer: function(value) {
      return ["__element = document.createTextNode('')", "__observeText(__element, " + value + ")", "__push __element", "__pop()"];
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

  exports.renderJST = function(parseTree, _arg) {
    var compiler, error, explicitScripts, items, name, options, program, programSource, source, _ref;
    _ref = _arg != null ? _arg : {}, explicitScripts = _ref.explicitScripts, name = _ref.name, compiler = _ref.compiler;
    if (compiler) {
      CoffeeScript = compiler;
    }
    util.explicitScripts = explicitScripts;
    items = util.renderNodes(parseTree);
    source = "(data) ->\n  (->\n    {\n      __push\n      __pop\n      __observeAttribute\n      __observeText\n      __on\n      __each\n      __with\n    } = Runtime(this) # TODO Namespace\n\n    __push document.createDocumentFragment()\n" + (util.indent(items.join("\n"), "    ")) + "\n    __pop()\n  ).call(data)";
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
