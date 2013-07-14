(function() {
  var Runtime, dataName;

  dataName = "__hamlJR_data";

  Runtime = function(context) {
    var append, lastParent, observeAttribute, observeText, pop, push, stack, top;
    stack = [];
    lastParent = function() {
      var element, i;
      i = stack.length - 1;
      while ((element = stack[i]) && element.nodeType === 11) {
        i -= 1;
      }
      return element;
    };
    top = function() {
      return stack[stack.length - 1];
    };
    append = function(child) {
      var _ref;
      if ((_ref = top()) != null) {
        _ref.appendChild(child);
      }
      return child;
    };
    push = function(child) {
      return stack.push(child);
    };
    pop = function() {
      return append(stack.pop());
    };
    observeAttribute = function(element, name, value) {
      var observable, update;
      update = function(newValue) {
        return element.setAttribute(name, newValue);
      };
      if (typeof Observable === "undefined" || Observable === null) {
        update(value);
        return;
      }
      observable = Observable.lift(value);
      observable.observe(update);
      return update(observable());
    };
    observeText = function(node, value) {
      var observable, unobserve, update;
      if (typeof Observable === "undefined" || Observable === null) {
        node.nodeValue = value;
        return;
      }
      observable = Observable.lift(value);
      update = function(newValue) {
        return node.nodeValue = newValue;
      };
      observable.observe(update);
      update(observable());
      unobserve = function() {};
      return node.addEventListener("DOMNodeRemoved", unobserve, true);
    };
    return {
      __push: push,
      __pop: pop,
      __observeAttribute: observeAttribute,
      __observeText: observeText,
      __each: function(items, fn) {
        return items.each(function(item) {
          var element;
          element = fn.call(item);
          return element[dataName] = item;
        });
      },
      __with: function(item, fn) {
        var element, replace, value;
        element = null;
        item = Observable.lift(item);
        item.observe(function(newValue) {
          return replace(element, newValue);
        });
        value = item();
        replace = function(oldElement, value) {
          var parent;
          element = fn.call(value);
          element[dataName] = item;
          if (oldElement) {
            parent = oldElement.parentElement;
            parent.insertBefore(element, oldElement);
            return oldElement.remove();
          } else {

          }
        };
        return replace(element, value);
      },
      __on: function(eventName, fn) {
        var element;
        element = lastParent();
        if (eventName === "change") {
          switch (element.nodeName) {
            case "SELECT":
              element["on" + eventName] = function() {
                var selectedOption;
                selectedOption = this.options[this.selectedIndex];
                return fn(selectedOption[dataName]);
              };
              if (fn.observe) {
                return fn.observe(function(newValue) {
                  return Array.prototype.forEach.call(element.options, function(option, index) {
                    if (option[dataName] === newValue) {
                      return element.selectedIndex = index;
                    }
                  });
                });
              }
              break;
            default:
              element["on" + eventName] = function() {
                return fn(element.value);
              };
              if (fn.observe) {
                return fn.observe(function(newValue) {
                  return element.value = newValue;
                });
              }
          }
        } else {
          return element["on" + eventName] = function() {
            return fn.call(context, event);
          };
        }
      }
    };
  };

  (typeof window !== "undefined" && window !== null ? window : exports).Runtime = Runtime;

}).call(this);
