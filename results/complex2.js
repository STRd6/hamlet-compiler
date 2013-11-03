(function(data) {
  return (function() {
    var __runtime;
    __runtime = HAMLjr.Runtime(this);
    __runtime.push(document.createDocumentFragment());
    __runtime.text("!!!\n");
    __runtime.push(document.createElement("html"));
    __runtime.push(document.createElement("head"));
    __runtime.push(document.createElement("title"));
    __runtime.text("Ravel | " + this.name + "'s photo tagged " + this.tag + "\n");
    __runtime.pop();
    this.props.each(function(key, value) {
      __runtime.push(document.createElement("meta"));
      __runtime.attribute("property", key);
      __runtime.attribute("content", value);
      return __runtime.pop();
    });
    __runtime.push(document.createElement("link"));
    __runtime.attribute("href", "/images/favicon.ico");
    __runtime.attribute("rel", "icon");
    __runtime.attribute("type", "image/x-icon");
    __runtime.pop();
    __runtime.push(document.createElement("link"));
    __runtime.attribute("rel", "stylesheet");
    __runtime.attribute("href", "/stylesheets/normalize.css");
    __runtime.pop();
    __runtime.push(document.createElement("link"));
    __runtime.attribute("rel", "stylesheet");
    __runtime.attribute("href", "/stylesheets/bootstrap.min.css");
    __runtime.pop();
    __runtime.push(document.createElement("link"));
    __runtime.attribute("rel", "stylesheet");
    __runtime.attribute("href", "/stylesheets/main.css");
    __runtime.pop();
    __runtime.push(document.createElement("script"));
    __runtime.attribute("src", "//use.typekit.net/ghp4eka.js");
    __runtime.pop();
    
      try{Typekit.load();}catch(e){}
      
      
    ;
    __runtime.pop();
    __runtime.push(document.createElement("body"));
    __runtime.push(document.createElement("div"));
    __runtime.classes("facebook");
    __runtime.push(document.createElement("header"));
    __runtime.push(document.createElement("h1"));
    __runtime.classes("hide-text");
    __runtime.text("Ravel\n");
    __runtime.pop();
    __runtime.pop();
    __runtime.push(document.createElement("div"));
    __runtime.classes("content");
    __runtime.push(document.createElement("div"));
    __runtime.classes("container");
    __runtime.push(document.createElement("div"));
    __runtime.classes("individual");
    __runtime.push(document.createElement("div"));
    __runtime.classes("user-container", "clearfix");
    __runtime.push(document.createElement("div"));
    __runtime.classes("left");
    __runtime.push(document.createElement("div"));
    __runtime.classes("user-image");
    __runtime.push(document.createElement("img"));
    __runtime.attribute("src", this.profile_picture_url);
    __runtime.pop();
    __runtime.pop();
    __runtime.push(document.createElement("div"));
    __runtime.classes("user-info");
    __runtime.push(document.createElement("span"));
    __runtime.classes("name");
    __runtime.text(this.name);
    __runtime.pop();
    __runtime.push(document.createElement("span"));
    __runtime.classes("info");
    __runtime.text(this.gender_and_age);
    __runtime.pop();
    __runtime.push(document.createElement("span"));
    __runtime.classes("location", "info");
    __runtime.text(this.location);
    __runtime.pop();
    __runtime.push(document.createElement("span"));
    __runtime.classes("tag");
    __runtime.text(this.tag);
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.push(document.createElement("div"));
    __runtime.classes("right");
    __runtime.push(document.createElement("span"));
    __runtime.classes("pins");
    __runtime.push(document.createElement("img"));
    __runtime.attribute("src", "/images/pins@2x.png");
    __runtime.pop();
    __runtime.text(this.pins);
    __runtime.pop();
    __runtime.push(document.createElement("span"));
    __runtime.classes("likes");
    __runtime.push(document.createElement("img"));
    __runtime.attribute("src", "/images/likes@2x.png");
    __runtime.pop();
    __runtime.text(this.likes);
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.push(document.createElement("div"));
    __runtime.classes("photo-container");
    __runtime.push(document.createElement("img"));
    __runtime.attribute("src", this.photo_url);
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.push(document.createElement("div"));
    __runtime.classes("download-button");
    __runtime.push(document.createElement("a"));
    __runtime.classes("button", "appstore");
    __runtime.attribute("href", "http://itunes.apple.com/us/app/ravel!/id610859881?ls=1&mt=8");
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    __runtime.pop();
    return __runtime.pop();
  }).call(data);
});
