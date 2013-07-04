(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["filters2"] = function(data) {
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
      
      alert('yolo');
      
    ;
      alert("yolo");
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "class", "duder");
      __element.setAttribute("class", "duder");
      __push(document.createDocumentFragment());
      __element = document.createTextNode("col");
      __observeText(__element, "col");
      __push(__element);
      __pop();
      __element = document.createTextNode("sweets\n");
      __observeText(__element, "sweets\n");
      __push(__element);
      __pop();
      __pop();
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "class", "duder2");
      __element.setAttribute("class", "duder2");
      __push(document.createDocumentFragment());
      __element = document.createTextNode("cool");
      __observeText(__element, "cool");
      __push(__element);
      __pop();
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
