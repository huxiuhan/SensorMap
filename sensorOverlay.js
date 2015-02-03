SensorOverlay.prototype = new google.maps.OverlayView();


function SensorOverlay(sensor) { //construction function for SensorOverlay
  var map = SensorOverlay.map;
  var defaults = {
    //public
    geometry: {type: null},
    data: {value: null, unit: null},
    script: {
      valueUpdateHandler: function() {}, // trigger when sensor's value is updated
      zoomChangedHandler: function() {}, // trigger when the zoom level of the map is changed
      groupValue: function() { if (this.group_.length==0) {return this.data.value} else {return this.group_.length+1}},
      // the value defined for a cluster of sensors
      groupCondition: function(another) { return false }
      // condition check for when we need to cluster a sensor with another sensor.
    },
    //private
    div_: null,
    feature_: null,
    group_: [],
    isDelegate_: true
  }
  $.extend(true, this, defaults, sensor);
  $.extend(this, this.script);


  this.setMap(map);
  if (map.sensorOverlays == undefined) {map.sensorOverlays = [];};

  map.sensorOverlays[this.id] = this;


}

SensorOverlay.prototype.onAdd = function() {
  // add a floating div for the sensor to show the data and icon
  var div = document.createElement('div');
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';
  this.div_ = div;

  var panes = this.getPanes();
  panes.floatPane.appendChild(div);

  // draw the geojson feature if the geometry of the sensor is a polygon

  if (this.geometry.type == 'polygon') {
    var so = this;
    //this.geojsonURL = sensor.geometry.geojsonURL;
    $.getJSON(this.geometry.geojsonURL, function(d){
      d.id = so.id;
      t = map.data.addGeoJson(d);
      so.feature_ = t[0];
      so.geometry.origin = so.feature_.getGeometry();
    });
  }

};

SensorOverlay.prototype.draw = function() {

  // if it is a environmental sensor (point), we draw the div at that point.
  if (this.geometry.type == 'point') {
    var overlayProjection = this.getProjection();
    this.latlng_ = new google.maps.LatLng(this.geometry.lat, this.geometry.lng);
    var pos = overlayProjection.fromLatLngToDivPixel(this.latlng_);
    var div = this.div_;

    div.style.left = pos.x - parseInt(div.style.width)/2 +'px';
    div.style.top = pos.y - parseInt(div.style.height)/2 +'px';
    //div.style.fontSize = this.map.zoom + 'px';

    $.extend(div.style, this.style);
    //for (key in this.style) {
      //div.style[key] = this.style[key];
    //}

    // if the sensor has a radius range, draw it
    if (this.geometry.radius) {
      var circleOption = {
        map: map,
        center: this.latlng_,
        radius:this.geometry.radius
      };
      $.extend(true, circleOption, this.style);
      if (!this.geometry.circle) {
        this.geometry.circle = new google.maps.Circle(circleOption);
      } else {
        this.geometry.circle.setOptions(circleOption);
      }
    }
  // otherwise it's polygon, we change the style of its geojson feature
  } else {
    var ft = this.feature_;
    this.map.data.overrideStyle(ft, this.style);
  }
};


SensorOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
  this.map.data.remove(this.feature_);
  this.feature_ = null;

  var idx = this.map.sensorOverlays.indexOf(this);
  if (idx>-1) {
    this.map.sensorOverlays.splice(index,1);
  }
};

// update sensor value
SensorOverlay.prototype.update = function(d) {
  this.data = d;
  // invoke valueUpdateHandler here
  this.valueUpdateHandler();
  this.draw();
};

SensorOverlay.prototype.hide = function() {
  if (this.div_) {
    this.style.visibility = 'hidden';
  }
  if (this.feature_) {
    this.style.visible = false;
  }
};


SensorOverlay.prototype.show = function() {
  if (this.div_) {
    this.style.visibility = 'visible';
  }
  if (this.feature_) {
    this.style.visible = true;
  }

};


function zoomChangedHandler() {

  var sos = map.sensorOverlays;
  var sosc = [];

  // generate a list of ids for existing sensors
  for (idx in sos) {
    if (sos[idx]!=undefined) {
      sosc[sosc.length] = idx;
    }
  }


  var dCount = 0;
  while (sosc.length>0) {
    // select a sensor from list
    var c = sosc.pop();
    var soc = sos[c];
    var new_sosc = [];

    // choose that sensor to be a delegate
    soc.isDelegate_ = true;
    soc.group_ = [];
    soc.show();
    dCount = dCount + 1;

    // Check if there any sensor need to be clustered with current selected
    // delegate sensor. If so, add it to the group_ of current sensor.
    for (idx in sosc) {
      var ele = sosc[idx];
      var so = sos[ele];

      if (soc.groupCondition(so)) {
        soc.group_[soc.group_.length] = so;
        so.isDelegate_ = false;
        so.hide();
      } else {
        //not clustered sensors
        new_sosc[new_sosc.length] = ele;
      }
    }
    // unclustered sensor will be check in next iterations
    sosc = new_sosc;
  }
  console.log('delegate marker count = ', dCount);
  for (idx in sos) {
    if (sos[idx]!=undefined) {
      var so = sos[idx];
      // invoke zoomChangedHandler for all sensors
      so.zoomChangedHandler();
    }
  }
}


SensorOverlay.init = function (map) {
  SensorOverlay.map = map;
  google.maps.event.addListener(map, 'zoom_changed', zoomChangedHandler);
}