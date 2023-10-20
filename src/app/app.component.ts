import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {CasesService} from "./services/cases.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit, OnInit{

  constructor(private authService: AuthService, private casesService: CasesService, private cdr: ChangeDetectorRef) {}

  email = 'admin@admin.com';
  password = '123456';
  casos: any;

  login(){
    this.authService.login(this.email, this.password).subscribe((token) => {
      localStorage.setItem('token', token.token);
      this.getCases();
    });
  }

  getCases(){
    this.casesService.getCases().subscribe((data) => {
      this.casos = data;
      this.mapInitializer();
    });
  }

  //referenciar o mapa no html
  @ViewChild('map', {static: false}) gmap!: ElementRef;

  //ciclo de vida que inicializa apos a view ser carregada
  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.login();
  }

  //função do mapa
  mapInitializer(): void {

    //variaveis de controle do mapa

      //limites do mapa
    const allowedBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-21.266389, -50.547887),
      new google.maps.LatLng(-21.105210, -50.370498)
    );

      //ajustar a centralização do mapa
    const centerLat = (-21.266389 + -21.105210) / 2;
    const centerLng = (-50.547887 + -50.370498) / 2;
    const adjustmentLat = 0.02;
    const adjustmentLng = 0.01;
    const adjustedCenterLat = centerLat - adjustmentLat;
    const adjustedCenterLng = centerLng + adjustmentLng;
    const coordinates = new google.maps.LatLng(adjustedCenterLat, adjustedCenterLng);

      //estilo do mapa
    const mapStyles = [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
      },
    ];

     //opções do mapa
    const mapOptions: google.maps.MapOptions = {
      center: coordinates,
      zoom: 13,
      styles: mapStyles,
      restriction: {
        latLngBounds: allowedBounds,
        strictBounds: true
     }
    };

     //gerar o mapa
    const map = new google.maps.Map(this.gmap.nativeElement, mapOptions);

     //informações dos pontos
    const infoWindow = new google.maps.InfoWindow();

      //carregar o geojson
    map.data.loadGeoJson('assets/data2.geojson');

      //estilo do mapa - geojson
    map.data.setStyle((feature: any) =>{
      let fillColor;
      const zona = feature.getProperty('Zona');

      switch (zona) {
        case 'Norte':
          fillColor = 'red';
          break;
        case 'Sul':
          fillColor = 'green';
          break;
        case 'Leste':
          fillColor = 'yellow';
          break;
        case 'Oeste':
          fillColor = 'orange';
          break;
        default:
          fillColor = 'blue';
          break;
      }

      return {
        fillColor: fillColor,
        strokeWeight: 0
      };
    });

      //evento de click - infoWindow
    map.data.addListener('click', (event: any) => {
      const geometryType = event.feature.getGeometry().getType();
      if (geometryType === 'Point') {
        const content = event.feature.getProperty('Name') || 'Nome não disponível';
        infoWindow.setContent(content);
        infoWindow.setPosition(event.feature.getGeometry().get());
        infoWindow.open(map);
      }
    });

    this.addMarkers(map);
  }

  async addMarkers(map: google.maps.Map): Promise<void> {
    await this.loadPolygons(map);

    this.casos.forEach((item: any) => {
      if (item.latitude && item.longitude) {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        const zona = this.getZonaForLatLng(lat, lng);
        const status = item.status;

        const circle = new google.maps.Circle({
          strokeColor: '#800080',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#800080',
          fillOpacity: 0.35,
          map: map,
          center: new google.maps.LatLng(lat, lng),
          radius: 100
        });

        const infoContent = zona ?
          `<div>Status: ${status}</div><div>Zona: ${zona}</div>` :
          `<div>Status: ${status}</div><div>Zona não determinada</div>`;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        circle.addListener('click', (event: any) => {
          infoWindow.setPosition(event.latLng);
          infoWindow.open(map);
        });
      }
    });
  }

  //verificar zonas
  polygons: google.maps.Polygon[] = [];

  loadPolygons(map: google.maps.Map): Promise<void> {
    return new Promise((resolve, reject) => {
      map.data.loadGeoJson('assets/data2.geojson', {}, (features) => {
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
        console.log("Total de polígonos carregados:", this.polygons.length);
        resolve();
      });
    });
  }

  getZonaForLatLng(lat: number, lng: number): string | null {
    const point = new google.maps.LatLng(lat, lng);
    const foundPolygon = this.polygons.find(polygon => {
      const isInside = google.maps.geometry.poly.containsLocation(point, polygon);
      return isInside;
    });
    return foundPolygon ? foundPolygon.get("zona") : null;
  }



}
