import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit{
  title = 'mapaUnesp';

  @ViewChild('map', {static: false}) gmap!: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.mapInitializer();
  }

  mapInitializer(): void {
    const allowedBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-22.0150, -48.9400), // Coordenadas do canto inferior esquerdo
      new google.maps.LatLng(-22.0080, -48.9300)  // Coordenadas do canto superior direito
    );
    const coordinates = new google.maps.LatLng(-21.23352988542779, -50.458202039401094);
    const mapOptions: google.maps.MapOptions = {
      center: coordinates,
      zoom: 13,
    };
    const map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
    map.data.loadGeoJson('assets/data.geojson');
    map.data.setStyle({
      fillColor: 'blue',
      strokeWeight: 0
    });
    // map.setOptions({
    //   restriction: {
    //     latLngBounds: allowedBounds,
    //   }
    // })
  }
}
