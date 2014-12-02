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
