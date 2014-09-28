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
      console.log('in upvote');
      var karma = this.get('karma');
      var id = this.get('_id');
      var blip = this.get('model');
      this.set('karma', karma + 1);
      console.log(blip);
      var self = this;

      // Upload the new object to the server.
      $.ajax(COUCHDB_SERVER + '/blip/' + id, {
        method: 'PUT',
        data: JSON.stringify(blip),
        success: function(data) {
          Ember.$.getJSON(COUCHDB_SERVER + '/blip/' + id).then(function(new_blip) {
            self.set('_rev', new_blip._rev);
          });
        }
      });

    },

    downvote: function() {
      var karma = this.get('karma');
      var id = this.get('_id');
      var blip = this.get('model');
      this.set('karma', karma - 1);
      console.log(blip);
      var self = this;

      // Upload the new object to the server.
      $.ajax(COUCHDB_SERVER + '/blip/' + id, {
        method: 'PUT',
        data: JSON.stringify(blip),
        success: function(data) {
          Ember.$.getJSON(COUCHDB_SERVER + '/blip/' + id).then(function(new_blip) {
            self.set('_rev', new_blip._rev);
          });
        }
      });
    }
  }
});


/*
 * Date formatter that makes the dates look not terrible.
 */
Ember.Handlebars.helper('format-date', function(date) {
  return moment(date).fromNow();
});
