(function(data) {
  return (function() {
    var __attribute, __each, __filter, __on, __pop, __push, __render, __runtime, __text, __with, _ref;
    _ref = __runtime = HAMLjr.Runtime(this), __push = _ref.__push, __pop = _ref.__pop, __attribute = _ref.__attribute, __filter = _ref.__filter, __text = _ref.__text, __on = _ref.__on, __each = _ref.__each, __with = _ref.__with, __render = _ref.__render;
    __push(document.createDocumentFragment());
    
      alert('yolo');
      
      
    ;
    alert("yolo");
    __push(document.createElement("div"));
    __runtime.classes("duder");
    __push(document.createTextNode(''));
    __text("col\n");
    __pop();
    __push(document.createTextNode(''));
    __text("sweets\n\n");
    __pop();
    __pop();
    __push(document.createElement("div"));
    __runtime.classes("duder2");
    __push(document.createTextNode(''));
    __text("cool\n");
    __pop();
    __pop();
    return __pop();
  }).call(data);
});
