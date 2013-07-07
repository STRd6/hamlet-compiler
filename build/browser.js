(function() {
  var lexer, parser, renderJST, rerender, styl, util, _ref,
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
    $("#demo").empty();
    ast = parser.parse($("#template").val());
    template = Function("return " + render(ast, {
      compiler: CoffeeScript
    }))();
    data = Function("return " + CoffeeScript.compile("do ->\n" + util.indent($("#data").val()), {
      bare: true
    }))();
    $('#demo').append(template(data));
    style = styl($("#style").val(), {
      whitespace: true
    }).toString();
    return $('#demo').append("<style>" + style + "</style>");
  };

  $(function() {
    rerender();
    return $("#template, #data, #style").on("change", rerender);
  });

}).call(this);
