var COUCHDB_SERVER = 'http://rdius.co:5984';
var current_blips = [];


App = Ember.Application.create();

App.Router.map(function() {
  // put your routes here.
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    var allBlips = [];
    Ember.$.getJSON(COUCHDB_SERVER + '/blip/_all_docs').then(function(data) {
      $.each(data.rows, function(index, row) {
        Ember.$.getJSON(COUCHDB_SERVER + '/blip/' + row.id).then(function(blip) {
          console.log(blip);
          allBlips.pushObject(blip);
        });
      });
    });

    return allBlips;
  }
});

