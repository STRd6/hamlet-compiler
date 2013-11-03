(function(data) {
  return (function() {
    var __runtime;
    __runtime = HAMLjr.Runtime(this);
    __runtime.push(document.createDocumentFragment());
    __runtime.push(document.createElement("div"));
    __runtime.id(this.id);
    __runtime.classes("yolo", "cool cat");
    __runtime.attribute("data-test", "test");
    __runtime.attribute("dude", this.test);
    __runtime.pop();
    __runtime.push(document.createElement("div"));
    __runtime.id("test");
    __runtime.classes("yolo2", this.duder);
    __runtime.pop();
    return __runtime.pop();
  }).call(data);
});
