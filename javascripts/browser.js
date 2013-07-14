(function() {
  var Gistquire, load, parser, renderJST, rerender, save, styl, util, _ref,
    __slice = [].slice;

  parser = require('./haml-jr').parser;

  _ref = require('./renderer'), renderJST = _ref.renderJST, util = _ref.util;

  Gistquire = require('./gistquire');

  styl = require('styl');

  require('./runtime');

  window.parser = parser;

  window.render = renderJST;

  window.Observable = function(value) {
    var listeners, notify, self;
    listeners = [];
    notify = function(newValue) {
      return listeners.each(function(listener) {
        return listener(newValue);
      });
    };
    self = function(newValue) {
      if (arguments.length > 0) {
        if (value !== newValue) {
          value = newValue;
          notify(newValue);
        }
      }
      return value;
    };
    Object.extend(self, {
      observe: function(listener) {
        return listeners.push(listener);
      },
      each: function() {
        var args, _ref1;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (value != null) {
          return (_ref1 = [value]).each.apply(_ref1, args);
        }
      }
    });
    return self;
  };

  Observable.lift = function(object) {
    var dummy, value;
    if (typeof object.observe === "function") {
      return object;
    } else {
      value = object;
      dummy = function(newValue) {
        if (arguments.length > 0) {
          return value = newValue;
        } else {
          return value;
        }
      };
      dummy.observe = function() {};
      dummy.each = function() {
        var args, _ref1;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (value != null) {
          return (_ref1 = [value]).forEach.apply(_ref1, args);
        }
      };
      return dummy;
    }
  };

  rerender = (function() {
    var ast, coffee, data, haml, selector, style, template, _ref1;
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
    ast = parser.parse(haml);
    template = Function("return " + render(ast, {
      compiler: CoffeeScript
    }))();
    data = Function("return " + CoffeeScript.compile("do ->\n" + util.indent(coffee), {
      bare: true
    }))();
    style = styl(style, {
      whitespace: true
    }).toString();
    return $(selector).empty().append(template(data)).append("<style>" + style + "</style>");
  }).debounce(100);

  save = function() {
    var data, postData, style, template;
    data = $("#data").val();
    template = $("#template").val();
    style = $("#style").val();
    postData = JSON.stringify({
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
    return $.ajax("https://api.github.com/gists", {
      type: "POST",
      dataType: 'json',
      data: postData,
      success: function(data) {
        return location.hash = data.id;
      }
    });
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

  $(function() {
    var id;
    window.editors = [["data", "coffee"], ["template", "haml"], ["style", "stylus"]].map(function(_arg) {
      var editor, id, mode;
      id = _arg[0], mode = _arg[1];
      editor = ace.edit(id);
      editor.setTheme("ace/theme/tomorrow");
      editor.getSession().setMode("ace/mode/" + mode);
      editor.getSession().on('change', rerender);
      return editor;
    });
    if (id = location.hash) {
      load(id.substring(1));
    } else {
      rerender();
    }
    return $("#actions .save").on("click", save);
  });

}).call(this);
