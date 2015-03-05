README
====

The goal of the project, Sensor Overlay for Google Maps, is to find a way
to display information from the sensors as an overlay on Google Maps. The
map view should be updated in real-time and work without user intervention
most of time. There are innumerable kinds of sensors in real world, so the user
should be able to customize the appearance according to the state of sensors.
Another problem is that if there are too many sensors in a narrow space, the
map view will be too crowded to be readable, unless we can cluster the sensors
in a reasonable way.


Files
----

sensorOverlay.js: a implementation of a sensor overlay for google map.

*_thermo.png: images used as icon of a thermometer sensor marker.

g?.json: geojson files for 8 example polygon markers.

map.html: the page showing the map, containing demo codes.

test_server.js: a node.js http server for serving static files.

To Use
----

Install dependencies:

```
npm install
```

Start the server by running `test_server.js`:

```
node test_server.js
```

Browse to http://0.0.0.0:8080/map.html to see it fires.


Author
——-

Xiuhan Hu