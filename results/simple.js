(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["simple"] = function(data) {
    return (function() {
      var observing, __element, __observeAttribute, __observeText, __on, __pop, __push, _ref;
      _ref = Runtime(), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, observing = _ref.observing;
      __push(document.createDocumentFragment());
      __element = document.createElement("section");
      __push(__element);
      __observeAttribute(__element, "id", "main");
      __element.setAttribute("id", "main");
      __observeAttribute(__element, "class", "container");
      __element.setAttribute("class", "container");
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
