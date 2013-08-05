(function() {
  var _base;

  this.HAMLjr || (this.HAMLjr = {});

  (_base = this.HAMLjr).templates || (_base.templates = {});

  this.HAMLjr.templates["filters2"] = function(data) {
    return (function() {
      var __attribute, __each, __element, __on, __pop, __push, __render, __text, __with, _ref;
      _ref = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
      __push(document.createDocumentFragment());
      
      alert('yolo');
      
      
    ;
      alert("yolo");
      __element = document.createElement("div");
      __push(__element);
      __attribute(__element, "class", "duder");
      __element = document.createTextNode('');
      __text(__element, "col\n");
      __push(__element);
      __pop();
      __element = document.createTextNode('');
      __text(__element, "sweets\n\n");
      __push(__element);
      __pop();
      __pop();
      __element = document.createElement("div");
      __push(__element);
      __attribute(__element, "class", "duder2");
      __element = document.createTextNode('');
      __text(__element, "cool\n");
      __push(__element);
      __pop();
      __pop();
      return __pop();
    }).call(data);
  };

}).call(this);
