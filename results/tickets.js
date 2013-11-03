(function(data) {
  return (function() {
    var __runtime;
    __runtime = HAMLjr.Runtime(this);
    __runtime.push(document.createDocumentFragment());
    __runtime.text("Choose a ticket class:\n");
    __runtime.push(document.createElement("select"));
    __runtime.on("change", this.chosenTicket);
    __runtime.each(this.tickets, function() {
      __runtime.push(document.createElement("option"));
      __runtime.text(this.name);
      return __runtime.pop();
    });
    __runtime.pop();
    __runtime.push(document.createElement("button"));
    __runtime.text("Clear\n");
    __runtime.on("click", this.resetTicket);
    __runtime.pop();
    __runtime["with"](this.chosenTicket, function() {
      __runtime.push(document.createElement("p"));
      if (this.price) {
        __runtime.text("You have chosen\n");
        __runtime.push(document.createElement("b"));
        __runtime.text(this.name);
        __runtime.pop();
        __runtime.push(document.createElement("span"));
        __runtime.text("$" + this.price + "\n");
        __runtime.pop();
      } else {
        __runtime.text("No ticket chosen\n");
      }
      return __runtime.pop();
    });
    return __runtime.pop();
  }).call(data);
});
