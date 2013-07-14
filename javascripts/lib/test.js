(function(data) {
  return (function() {
    var __append, __element, __observeAttribute, __observeText, __pop, __push, __stack;
    __stack = [];
    __append = function(child) {
      var _ref;
      return ((_ref = __stack[__stack.length - 1]) != null ? _ref.appendChild(child) : void 0) || child;
    };
    __push = function(child) {
      return __stack.push(child);
    };
    __pop = function() {
      return __append(__stack.pop());
    };
    __observeAttribute = function(element, name, value) {
      return typeof value.observe === "function" ? value.observe(function(newValue) {
        return element.setAttribute(name, newValue);
      }) : void 0;
    };
    __observeText = function(node, value) {
      return typeof value.observe === "function" ? value.observe(function(newValue) {
        return node.nodeValue(newValue);
      }) : void 0;
    };
    __push(document.createDocumentFragment());
    __element = document.createElement("html");
    __push(__element);
    __push(document.createDocumentFragment());
    __element = document.createElement("head");
    __push(__element);
    __push(document.createDocumentFragment());
    __element = document.createElement("script");
    __push(__element);
    __observeAttribute(__element, "src", "lib/cornerstone.js");
    __element.setAttribute("src", "lib/cornerstone.js");
    __pop();
    __element = document.createElement("script");
    __push(__element);
    __observeAttribute(__element, "src", "lib/coffee-script.js");
    __element.setAttribute("src", "lib/coffee-script.js");
    __pop();
    __element = document.createElement("script");
    __push(__element);
    __observeAttribute(__element, "src", "build/web.js");
    __element.setAttribute("src", "build/web.js");
    __pop();
    __pop();
    __pop();
    __element = document.createElement("body");
    __push(__element);
    __push(document.createDocumentFragment());
    __element = document.createElement("textarea");
    __push(__element);
    __pop();
    __element = document.createElement("script");
    __push(__element);
    __element.innerHTML = "\n  (function() {\n    var data, templateHaml,\n      __slice = [].slice;\n  \n    window.Observable = function(value) {\n      var listeners, notify, self;\n      listeners = [];\n      notify = function(newValue) {\n        return listeners.each(function(listener) {\n          return listener(newValue);\n        });\n      };\n      self = function(newValue) {\n        if (arguments.length > 0) {\n          if (value !== newValue) {\n            value = newValue;\n            notify(newValue);\n          }\n        }\n        return value;\n      };\n      Object.extend(self, {\n        observe: function(listener) {\n          return listeners.push(listener);\n        },\n        each: function() {\n          var args, _ref;\n          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];\n          return (_ref = [].concat(value)).each.apply(_ref, args);\n        }\n      });\n      return self;\n    };\n  \n    templateHaml = \"%select\\n  - @tickets.each (ticket) ->\\n    %option\\n      = ticket.name\";\n  \n    data = {\n      tickets: Observable([\n        {\n          name: \"Economy\",\n          price: 199.95\n        }, {\n          name: \"Business\",\n          price: 449.22\n        }, {\n          name: \"First Class\",\n          price: 1199.99\n        }\n      ]),\n      chosenTicket: Observable()\n    };\n  \n  }).call(this);\n  ";
    __pop();
    __pop();
    __pop();
    __pop();
    __pop();
    return __pop();
  }).call(data);
});
