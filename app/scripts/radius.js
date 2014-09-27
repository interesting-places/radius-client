var COUCHDB_SERVER = 'http://rdius.co:5984';
var current_blips = [];


function addBlipToMap(blip) {
  console.log(blip);
  console.log(map);
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(blip.latitude, blip.longitude),
    map: map,
    title: blip.title,
    animation: google.maps.Animation.DROP
  });
}

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

          addBlipToMap(blip);

          console.log(blip);
          allBlips.pushObject(blip);
        });
      });
    });

    return allBlips;
  }
});

