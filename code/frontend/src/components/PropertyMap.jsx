import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: 12.9716, // Bangalore default
  lng: 77.5946
};

const libraries = ['places'];

const PropertyMap = ({ properties }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
    libraries
  });

  const [selected, setSelected] = useState(null);

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    properties?.forEach(p => {
       if(p.lat && p.lng) bounds.extend({ lat: p.lat, lng: p.lng });
    });
    // If no properties with coordinates, use default center
    if (properties?.length > 0 && properties.some(p => p.lat && p.lng)) {
        map.fitBounds(bounds);
    }
    setMap(map);
  }, [properties]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (!isLoaded) return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-dark-800 rounded-2xl border border-white/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="w-full h-full min-h-[400px] overflow-hidden rounded-2xl border border-white/10 shadow-glow-sm">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
            styles: [
                {
                  "elementType": "geometry",
                  "stylers": [{ "color": "#1d1d55" }]
                },
                {
                  "elementType": "labels.text.fill",
                  "stylers": [{ "color": "#8c8cb5" }]
                },
                {
                  "elementType": "labels.text.stroke",
                  "stylers": [{ "color": "#1d1d55" }]
                },
                {
                  "featureType": "administrative",
                  "elementType": "geometry.stroke",
                  "stylers": [{ "color": "#4b4b8a" }]
                },
                {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": [{ "color": "#0a0a1a" }]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [{ "color": "#2c2c6d" }]
                }
            ],
            disableDefaultUI: true,
            zoomControl: true,
        }}
      >
        {properties?.map((p) => (
          (p.lat && p.lng) && (
            <Marker
                key={p._id}
                position={{ lat: p.lat, lng: p.lng }}
                onClick={() => setSelected(p)}
                icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: "#6171f6",
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: "#ffffff",
                    scale: 1.5,
                }}
            />
          )
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="p-2 text-dark-900">
              <h4 className="font-bold text-sm">{selected.title}</h4>
              <p className="text-xs opacity-70">{selected.location}</p>
              <p className="text-primary-600 font-bold mt-1">₹{selected.rent?.toLocaleString()}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default PropertyMap;
