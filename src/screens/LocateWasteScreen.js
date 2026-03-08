import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Title, Paragraph, Card, FAB, Text } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MapPin } from 'lucide-react-native';

const MADURAI_LOCATIONS = [
  { id: 1, name: "Vellaikkal Yard", lat: 9.8732, lon: 78.1456, type: "Processing" },
  { id: 2, name: "Anna Nagar Center", lat: 9.9189, lon: 78.1404, type: "Collection" },
  { id: 3, name: "Sellur Point", lat: 9.9421, lon: 78.1189, type: "Regional" },
  { id: 4, name: "Simmakkal MCC", lat: 9.9252, lon: 78.1194, type: "Composting" },
  { id: 5, name: "Periyar Bin", lat: 9.9174, lon: 78.1118, type: "Rapid" },
  { id: 6, name: "K.Pudur MCC", lat: 9.9436, lon: 78.1487, type: "MCC" }
];

const LocateWasteScreen = () => {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .marker-pin {
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            background: #2E7D32;
            position: absolute;
            transform: rotate(-45deg);
            left: 50%;
            top: 50%;
            margin: -15px 0 0 -15px;
            border: 2px solid white;
          }
          .marker-pin::after {
            content: '';
            width: 14px;
            height: 14px;
            margin: 8px 0 0 8px;
            background: #fff;
            position: absolute;
            border-radius: 50%;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([9.9252, 78.1118], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          const locations = ${JSON.stringify(MADURAI_LOCATIONS)};
          
          locations.forEach(loc => {
            const marker = L.marker([loc.lat, loc.lon]).addTo(map);
            marker.bindPopup('<b>' + loc.name + '</b><br>' + loc.type);
          });

          // Custom marker for center
          const centerMarker = L.marker([9.9252, 78.1118], {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#F44336;' class='marker-pin'></div>",
              iconSize: [30, 42],
              iconAnchor: [15, 42]
            })
          }).addTo(map);
          centerMarker.bindPopup('<b>Madurai Central</b>');

          window.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'FOCUS') {
              map.flyTo([data.lat, data.lon], 14);
            }
          });
        </script>
      </body>
    </html>
  `;

  const focusMadurai = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'FOCUS', lat: 9.9252, lon: 78.1118 }));
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading Map Content...</Text>
        </View>
      )}

      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Locate Waste Area</Title>
          <Paragraph style={styles.headerSubtitle}>Using Smart-Map (No API Key required).</Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.fabContainer}>
        <FAB
          icon={() => <MapPin size={24} color="#fff" />}
          label="Center on Madurai"
          style={styles.fab}
          onPress={focusMadurai}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontWeight: '500',
  },
  headerCard: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 30,
    zIndex: 5,
  },
  fab: {
    backgroundColor: '#2E7D32',
  }
});

export default LocateWasteScreen;
