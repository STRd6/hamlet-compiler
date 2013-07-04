(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["complex"] = function(data) {
    return (function() {
      var radicalMessage, __append, __element, __observeAttribute, __observeText, __pop, __push, __stack;
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
      __element = document.createElement("select");
      __push(__element);
      __push(document.createDocumentFragment());
      radicalMessage = "Yolo";
      this.tickets.forEach(function(ticket, i) {
        __push(document.createDocumentFragment());
        if (i === 0) {
          __push(document.createDocumentFragment());
          __element = document.createTextNode("" + radicalMessage);
          __observeText(__element, "" + radicalMessage);
          __push(__element);
          __pop();
          __pop();
        }
        __element = document.createElement("option");
        __push(__element);
        __push(document.createDocumentFragment());
        __element = document.createTextNode("" + ticket.name);
        __observeText(__element, "" + ticket.name);
        __push(__element);
        __pop();
        __pop();
        __pop();
        return __pop();
      });
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
