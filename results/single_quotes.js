(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["single_quotes"] = function(data) {
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
        var unobserve;
        if (value.observe != null) {
          value.observe(function(newValue) {
            return node.nodeValue(newValue);
          });
          unobserve = function() {
            return console.log("Removed");
          };
          return node.addEventListener("DOMNodeRemoved", unobserve, true);
        }
      };
      __push(document.createDocumentFragment());
      __element = document.createElement("img");
      __push(__element);
      __observeAttribute(__element, "src", 'http://duderman.info/#{yolocountyusa}');
      __element.setAttribute("src", 'http://duderman.info/#{yolocountyusa}');
      __observeAttribute(__element, "data-rad", 'what the duder?');
      __element.setAttribute("data-rad", 'what the duder?');
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
