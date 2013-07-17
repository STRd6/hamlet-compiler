(function() {
  var Observable,
    __slice = [].slice;

  Observable = function(value) {
    var listeners, notify, self;
    listeners = [];
    notify = function(newValue) {
      return listeners.each(function(listener) {
        return listener(newValue);
      });
    };
    self = function(newValue) {
      if (arguments.length > 0) {
        if (value !== newValue) {
          value = newValue;
          notify(newValue);
        }
      }
      return value;
    };
    Object.extend(self, {
      observe: function(listener) {
        return listeners.push(listener);
      },
      each: function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (value != null) {
          return (_ref = [value]).each.apply(_ref, args);
        }
      }
    });
    if (Array.isArray(value)) {
      Object.extend(self, {
        each: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return value.each.apply(value, args);
        },
        map: function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return value.map.apply(value, args);
        },
        remove: function(item) {
          var ret;
          ret = value.remove(item);
          notify(value);
          return ret;
        },
        push: function(item) {
          var ret;
          ret = value.push(item);
          notify(value);
          return ret;
        },
        pop: function() {
          var ret;
          ret = value.pop();
          notify(value);
          return ret;
        }
      });
    }
    return self;
  };

  Observable.lift = function(object) {
    var dummy, value;
    if (typeof object.observe === "function") {
      return object;
    } else {
      value = object;
      dummy = function(newValue) {
        if (arguments.length > 0) {
          return value = newValue;
        } else {
          return value;
        }
      };
      dummy.observe = function() {};
      dummy.each = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (value != null) {
          return (_ref = [value]).forEach.apply(_ref, args);
        }
      };
      return dummy;
    }
  };

  module.exports = Observable;

}).call(this);
