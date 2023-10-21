export const urlMap = 'assets/data2.geojson';

export const allowedBounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(-21.266389, -50.547887),
  new google.maps.LatLng(-21.105210, -50.370498)
);

export const centerLat = (-21.266389 + -21.105210) / 2;
export const centerLng = (-50.547887 + -50.370498) / 2;
export const adjustmentLat = 0.02;
export const adjustmentLng = 0.01;

export const adjustedCenterLat = centerLat - adjustmentLat;
export const adjustedCenterLng = centerLng + adjustmentLng;

export const coordinates = new google.maps.LatLng(adjustedCenterLat, adjustedCenterLng);

export const mapStyles = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }]
  },
];

export const customIconUrlPoint = 'assets/icons/point.png';
export const customIconUrlMosquito = 'assets/icons/mosquito.png';
