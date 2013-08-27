(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["attributes"] = function(data) {
    return (function() {
      var __attribute, __each, __element, __filter, __on, __pop, __push, __render, __text, __with, _ref;
      _ref = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __filter = _ref.__filter, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
      __push(document.createDocumentFragment());
      __element = document.createElement("div");
      __push(__element);
      __attribute(__element, "id", this.id);
      __attribute(__element, "class", "yolo cool cat");
      __attribute(__element, "data-test", "test");
      __attribute(__element, "dude", this.test);
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __attribute(__element, "id", "test");
      __attribute(__element, "class", "yolo2 " + this.duder);
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
