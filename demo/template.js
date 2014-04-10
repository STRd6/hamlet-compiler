(function(data) {
  return (function() {
    var __runtime;
    __runtime = Runtime(this);
    __runtime.push(document.createDocumentFragment());
    __runtime.push(document.createElement("input"));
    __runtime.attribute("type", "text");
    __runtime.attribute("value", this.value);
    __runtime.pop();
    __runtime.push(document.createElement("hr"));
    __runtime.pop();
    __runtime.push(document.createElement("input"));
    __runtime.attribute("type", "range");
    __runtime.attribute("value", this.value);
    __runtime.attribute("min", "1");
    __runtime.attribute("max", this.max);
    __runtime.pop();
    __runtime.push(document.createElement("hr"));
    __runtime.pop();
    __runtime.push(document.createElement("progress"));
    __runtime.attribute("value", this.value);
    __runtime.attribute("max", this.max);
    __runtime.pop();
    return __runtime.pop();
  }).call(data);
});
