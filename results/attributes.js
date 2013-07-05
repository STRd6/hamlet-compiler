(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["attributes"] = function(data) {
    return (function() {
      var observing, __each, __element, __observeAttribute, __observeText, __on, __pop, __push, _ref;
      _ref = Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __observeAttribute = _ref.__observeAttribute, __observeText = _ref.__observeText, __on = _ref.__on, __each = _ref.__each, observing = _ref.observing;
      __push(document.createDocumentFragment());
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "id", this.id);
      __element.setAttribute("id", this.id);
      __observeAttribute(__element, "class", "yolo cool cat");
      __element.setAttribute("class", "yolo cool cat");
      __observeAttribute(__element, "data-test", "test");
      __element.setAttribute("data-test", "test");
      __observeAttribute(__element, "dude", this.test);
      __element.setAttribute("dude", this.test);
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __observeAttribute(__element, "id", "test");
      __element.setAttribute("id", "test");
      __observeAttribute(__element, "class", "yolo2 " + this.duder);
      __element.setAttribute("class", "yolo2 " + this.duder);
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
