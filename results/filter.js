(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["filter"] = function(data) {
    return (function() {
      var observing, __each, __element, __observeAttribute, __observeText, __on, __pop, __push, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, observing = _ref.observing;
      __push(document.createDocumentFragment());
      __element = document.createTextNode("cool\nsuper cool\n  double super cool\n");
      __observeText(__element, "cool\nsuper cool\n  double super cool\n");
      __push(__element);
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
