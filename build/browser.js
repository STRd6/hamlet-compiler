(function() {
  var lexer, load, parser, renderJST, rerender, save, styl, util, _ref,
    __slice = [].slice;

  parser = require('./parser').parser;

  lexer = require('../build/lexer').lexer;

  _ref = require('./renderer'), renderJST = _ref.renderJST, util = _ref.util;

  styl = require('styl');

  require('./runtime');

  parser.lexer = lexer;

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

  rerender = function() {
    var ast, data, style, template;
    $("#preview").empty();
    ast = parser.parse($("#template").val());
    template = Function("return " + render(ast, {
      compiler: CoffeeScript
    }))();
    data = Function("return " + CoffeeScript.compile("do ->\n" + util.indent($("#data").val()), {
      bare: true
    }))();
    $('#preview').append(template(data));
    style = styl($("#style").val(), {
      whitespace: true
    }).toString();
    return $('#preview').append("<style>" + style + "</style>");
  };

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
    return $.getJSON("https://api.github.com/gists/" + id, function(data) {
      ["data", "style", "template"].each(function(file) {
        var _ref1;
        return $("#" + file).val(((_ref1 = data.files[file]) != null ? _ref1.content : void 0) || "");
      });
      return rerender();
    });
  };

  $(function() {
    var id;
    if (id = location.hash) {
      load(id.substring(1));
    } else {
      rerender();
    }
    $("#template, #data, #style").on("change", rerender);
    return $("#actions .save").on("click", save);
  });

}).call(this);
