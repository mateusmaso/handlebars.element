if (typeof window === "undefined") {
  var JSDOM = require("jsdom").JSDOM;
  var dom = new JSDOM("test");
  var document = global.document = dom.window.document;
  var window = global.window = document.defaultView;
  var chai = require("chai");
  var Handlebars = require("handlebars");
  require("../lib").default(Handlebars);
}

describe("handlebars.element", function() {
  describe("element", function() {
    beforeEach(function() {
      Handlebars.registerElement("foo", function(attributes) {
        attributes = attributes || {};
        var div = document.createElement("div");
        div.id = attributes.id || "foo";
        if (attributes.foo) div.className = "foo";
        return div;
      }, {booleans: ["foo"]});

      Handlebars.registerElement("foo-option", function(attributes) {
        var option = document.createElement("option");
        option.value = "foo";
        return option;
      });

      Handlebars.registerAttribute("bar", function(element) {
        var id = document.createAttribute("id");
        id.value = "bar";
        return id;
      });
    });

    it("should be registered and parsable", function() {
      var template = Handlebars.compile("<hb-foo></hb-foo>");
      var nodes = Handlebars.parseHTML(template({}));
      var div = document.createElement("div");
      div.appendChild(nodes[0]);
      chai.expect(div.innerHTML).to.equal('<div id="foo"></div>');
    });

    it("should check for normal and boolean attributes", function() {
      var template = Handlebars.compile("<hb-foo id='hello-world' foo></hb-foo>");
      var nodes = Handlebars.parseHTML(template({}));
      var div = document.createElement("div");
      div.appendChild(nodes[0]);
      chai.expect(div.innerHTML).to.equal('<div id="hello-world" class="foo"></div>');
    });

    it("should render inside `select`", function() {
      var template = Handlebars.compile("<select><hb-foo-option></hb-foo-option></select>");
      var nodes = Handlebars.parseHTML(template({}));
      var div = document.createElement("div");
      div.appendChild(nodes[0]);
      chai.expect(div.innerHTML).to.equal('<select><option value="foo"></option></select>');
    });
  });

  describe("attribute", function() {
    it("should be registered and parsable", function() {
      var template = Handlebars.compile("<div hb-bar></div>");
      var nodes = Handlebars.parseHTML(template({}));
      var div = document.createElement("div");
      div.appendChild(nodes[0]);
      chai.expect(div.innerHTML).to.equal('<div id="bar"></div>');
    });

    it("should work on a custom element", function() {
      var template = Handlebars.compile("<hb-foo hb-bar></hb-foo>");
      var nodes = Handlebars.parseHTML(template({}));
      var div = document.createElement("div");
      div.appendChild(nodes[0]);
      chai.expect(div.innerHTML).to.equal('<div id="bar"></div>');
    });
  });
});
