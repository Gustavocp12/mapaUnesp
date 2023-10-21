import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReturnZoneService {

  constructor() { }

  private polygons: google.maps.Polygon[] = [];
  private urlGeoJson = 'assets/data2.geojson';

  public loadPolygons(map: google.maps.Map): Promise<void> {
    return new Promise((resolve) => {
      map.data.loadGeoJson(this.urlGeoJson, {}, (features) => {
        features.forEach((feature: google.maps.Data.Feature) => {
          const geometry = feature.getGeometry();
          if (geometry!.getType() === 'Polygon') {
            const polygonCoords = (geometry as google.maps.Data.Polygon).getAt(0).getArray().map((latLng: google.maps.LatLng) => {
              return {lat: latLng.lat(), lng: latLng.lng()};
            });
            const polygon = new google.maps.Polygon({
              paths: polygonCoords
            });
            polygon.set("zona", feature.getProperty('Zona'));
            this.polygons.push(polygon);
          }
        });
        resolve();
      });
    });
  }

  public getZonaForLatLng(lat: number, lng: number): string | null {
    const point = new google.maps.LatLng(lat, lng);
    const foundPolygon = this.polygons.find(polygon => {
      return google.maps.geometry.poly.containsLocation(point, polygon);
    });
    return foundPolygon ? foundPolygon.get("zona") : null;
  }

}
