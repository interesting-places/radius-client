/* Non-ember stuff */

var COUCHDB_SERVER = 'http://rdius.co:5984';

/*
 * Adds a blip to the global Google Map
 */
function addBlipToMap(blip) {
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(blip.latitude, blip.longitude),
    map: map,
    title: blip.title,
    animation: google.maps.Animation.DROP
  });
}

/* Begining of Ember stuff */

Radius = Ember.Application.create();
Radius.ApplicationManager = DS.FixtureAdapter.extend();

/*
 * The Blip model
 * The thing that's going to make us all billionares.
 */
Radius.Blip = DS.Model.extend({
  title: DS.attr('string'),
  latitude: DS.attr('double'),
  longitude: DS.attr('double'),
  username: DS.attr('string'),
  karma: DS.attr('integer')
});

Radius.Router.map(function() {
  this.resource('blips', { path: '/' });
});

Radius.BlipsController = Ember.ArrayController.extend({

});

Radius.BlipsRoute = Ember.Route.extend({

  model: function() {

    var allBlips = [];
    Ember.$.getJSON(COUCHDB_SERVER + '/blip/_all_docs').then(function(data) {
      $.each(data.rows, function(index, row) {
        Ember.$.getJSON(COUCHDB_SERVER + '/blip/' + row.id).then(function(blip) {

          addBlipToMap(blip);
          allBlips.pushObject(blip);
        });
      });
    });
    return allBlips;
  }

});


Radius.BlipController = Ember.ObjectController.extend({

  actions: {

    upvote: function() {
      var karma = this.get('karma');
      this.set('karma', karma + 1);
      console.log('in upvote');
    },

    downvote: function() {
      var karma = this.get('karma');
      this.set('karma', karma - 1);
      console.log('in downvote');
    }
  }
});
