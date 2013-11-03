(function(data) {
  return (function() {
    var __runtime;
    __runtime = HAMLjr.Runtime(this);
    __runtime.push(document.createDocumentFragment());
    __runtime.push(document.createElement("html"));
    __runtime.push(document.createElement("head"));
    __runtime.push(document.createElement("script"));
    __runtime.attribute("src", "lib/cornerstone.js");
    __runtime.pop();
    __runtime.push(document.createElement("script"));
    __runtime.attribute("src", "lib/coffee-script.js");
    __runtime.pop();
    __runtime.push(document.createElement("script"));
    __runtime.attribute("src", "lib/jquery-1.10.2.min.js");
    __runtime.pop();
    __runtime.push(document.createElement("script"));
    __runtime.attribute("src", "build/web.js");
    __runtime.pop();
    __runtime.pop();
    __runtime.push(document.createElement("body"));
    __runtime.push(document.createElement("textarea"));
    __runtime.text("Choose a ticket class:\n%select\n  - on \"change\", @chosenTicket\n  - each @tickets, ->\n    %option= @name\n\n%button Clear\n  - on \"click\", @resetTicket\n\n- with @chosenTicket, ->\n  %p\n    - if @price\n      You have chosen\n      %b= @name\n      %span\n        $\#{@price}\n    - else\n      No ticket chosen\n");
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    return __runtime.pop();
  }).call(data);
});
