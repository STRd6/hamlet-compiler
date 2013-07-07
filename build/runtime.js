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
      return typeof value.observe === "function" ? value.observe(function(newValue) {
        return element.setAttribute(name, newValue);
      }) : void 0;
    };
    observeText = function(node, value) {
      var unobserve;
      if (!value) {
        return;
      }
      if (value.observe != null) {
        value.observe(function(newValue) {
          return node.nodeValue(newValue);
        });
        unobserve = function() {
          return console.log("Removed");
        };
        return node.addEventListener("DOMNodeRemoved", unobserve, true);
      }
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
