(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["test"] = function(data) {
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
      __element = document.createTextNode("<literal>");
      __observeText(__element, "<literal>");
      __push(__element);
      __pop();
      __element = document.createTextNode("</literal>");
      __observeText(__element, "</literal>");
      __push(__element);
      __pop();
      __element = document.createTextNode("<yolo></yolo>");
      __observeText(__element, "<yolo></yolo>");
      __push(__element);
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
