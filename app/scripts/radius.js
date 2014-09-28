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
    else if (type === 'video') {
      var youtubeUrl = content.content.url;
      var result = '<iframe width="350" height="197" src="' + youtubeUrl + '" frameborder="0" allowfullscreen></iframe>';
      return result;
    }

    else if (type === 'audio') {
      var soundcloudUrl = content.content.url;
      var result = '<iframe width="100%" height="300" scrolling="no" frameborder="no" src="' + soundcloudUrl + '"></iframe>';
      return result;
    }
    else if (type === 'blog') {
      var blogUrl = content.content.url;
      var blogName = content.content.blogName;
      var result = '<p style="font-size: 10.5px;">' + content.content.blurb + '</p>';
      result = result + '<div style="font-size: 10.5px;">Read more at <a href="' + blogUrl + '">' + blogName + '</a></div>';
      return result;
    }
    else {
      return 'mystery content....';
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


/*
 * Some jquery magic becuase I'm new to ember.
 */

/*
 * Toggles the new blip view
 */
function toggleNewBlip(event) {
  $('#show-the-blips').animate({height: 'toggle'},
      { complete: function() {
          console.log('done with animation');
          $('#new-blip-container').animate({height: 'toggle'});
    }
  });
}



/*
 * Submits a new blip to the database
 */
function addNewBlip(event) {

  var title = $('#blipTitle').val();
  var text = $('#blipText').val();
  var photo = $('#blipPhotoUpload')[0].files[0];
  var lat = $('#blipLat').val();
  var lon = $('#blipLon').val();

  var blip = {
    datetime: new Date().toISOString(),
    title: title,
    user: 'thomas',
    karma: 0,
    latitude: lat,
    longitude: lon,
    content: {
      type: 'text',
      content: text
    }
  };

  // If we have a photo, then we need to upload that first
  $.ajax('http://rdius.co:5000/upload', {
    method: 'POST',
    data: photo,
    success: function(data) {
      console.log('Photo upload result');

    }
  });

  console.log(blip);

  // This one is for text

  $.ajax(COUCHDB_SERVER + '/blip', {
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(blip)
  });


  console.log(text);
  console.log(title);
  return false;
}

