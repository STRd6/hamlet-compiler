(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["simple"] = function(data) {
    return (function() {
      var __element, __observeAttribute, __observeText, __pop, __push, _ref;
      _ref = Runtime(), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText;
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
      __element = document.createTextNode(post.title);
      __observeText(__element, post.title);
      __push(__element);
      __pop();
      __pop();
      __element = document.createElement("h2");
      __push(__element);
      __element = document.createTextNode(post.subtitle);
      __observeText(__element, post.subtitle);
      __push(__element);
      __pop();
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "class", "content");
      __element.setAttribute("class", "content");
      __push(document.createDocumentFragment());
      __element = document.createTextNode(post.content);
      __observeText(__element, post.content);
      __push(__element);
      __pop();
      __pop();
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
