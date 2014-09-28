/* Non-ember stuff */

var COUCHDB_SERVER = 'http://rdius.co:5984';

/*
 * Adds a blip to the global Google Map
 */
function addBlipToMap(blip) {
  console.log('Adding blip to map...');
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

  /**
   * Gets the content of the blip.  But you know, only sort of.  So content-ish.
   */
  contentish: function(key, value) {

    /* We need to figure out what kind of content we are dealing with... text, picture, video, audio. */
    var content = this.get('content');
    var type = content.content.type;
    console.log(type);

    if (type === 'text') {
      console.log(content);
      return content.content.content;
    }
    else if (type === 'photo') {

      var photoUrl = content.content.url;
      var photoCaption = content.content.caption;
      var result = '<img src="' + photoUrl + '" style="max-width:350px; padding-bottom: 10px;" /><br />';
      result = result + '<p style="font-size: 11.5px;">' + photoCaption + '</p>';
      return result;

    }

  }.property('model.contentish'),


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

Ember.Handlebars.helper('safe', function(value, options) {
  console.log(value);
  return new Ember.Handlebars.SafeString(value);
});

/*
 * Date formatter that makes the dates look not terrible.
 */
Ember.Handlebars.helper('format-date', function(date) {
  return moment(date).fromNow();
});
