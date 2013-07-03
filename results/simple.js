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
      __element = document.createElement("section");
      __push(__element);
      __observeAttribute(__element, "id", "main");
      __element.setAttribute("id", "main");
      __observeAttribute(__element, "class", "container");
      __element.setAttribute("class", "container");
      __pop();
      __push(document.createDocumentFragment());
      __element = document.createElement("h1");
      __push(__element);
      __element = document.createTextNode("" + post.title);
      __observeText(__element, "" + post.title);
      __push(__element);
      __pop();
      __pop();
      __element = document.createElement("h2");
      __push(__element);
      __element = document.createTextNode("" + post.subtitle);
      __observeText(__element, "" + post.subtitle);
      __push(__element);
      __pop();
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "class", "content");
      __element.setAttribute("class", "content");
      __push(document.createDocumentFragment());
      __element = document.createTextNode("" + post.content);
      __observeText(__element, "" + post.content);
      __push(__element);
      __pop();
      __pop();
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
