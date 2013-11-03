(function(data) {
  return (function() {
    var radicalMessage, __runtime;
    __runtime = HAMLjr.Runtime(this);
    __runtime.push(document.createDocumentFragment());
    __runtime.push(document.createElement("select"));
    radicalMessage = "Yolo";
    this.tickets.forEach(function(ticket, i) {
      if (i === 0) {
        __runtime.text(radicalMessage);
      }
      __runtime.push(document.createElement("option"));
      __runtime.text(ticket.name);
      return __runtime.pop();
    });
    __runtime.pop();
    return __runtime.pop();
  }).call(data);
});
