import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {CasesService} from "./services/cases.service";
import {Modal} from "./modal/modal";
import {ModalComponent} from "./modal/modal.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit, OnInit{

  constructor(private authService: AuthService, private casesService: CasesService) {}

  email = 'admin@admin.com';
  password = '123456';
  casos: any;
  public showModalFlag = false;
  public Modalitens!: Modal;
  loadComplete = false;

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
  //referenciar o modal no html
  @ViewChild('modal', {static: false}) modal!: ModalComponent;

  //ciclo de vida que inicializa apos a view ser carregada
  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.login();
  }

  showModal(data: Modal): void {
    this.Modalitens = data;
    this.showModalFlag = true;
    setTimeout(() => {
      this.modal.verifyStatus();
    }, 0);
  }

  loadAndProcessGeoJson(map: google.maps.Map, url: string): void {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        data.features.forEach((feature: any) => {
          if (feature.geometry.type === 'Point') {
            const position = new google.maps.LatLng(
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0]
            );

            const marker = new google.maps.Marker({
              position: position,
              icon: 'assets/icons/point.png',
              map: map
            });

            marker.addListener('click', () => {
              const content = feature.properties.Name || 'Nome não disponível';
              const infoWindow = new google.maps.InfoWindow({
                content: content
              });
              infoWindow.open(map, marker);
            });
          }
        });
      });
    this.loadComplete = true;
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
      fullscreenControl: false,
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
    this.loadAndProcessGeoJson(map, 'assets/data2.geojson');

      //estilo do mapa - geojson
    map.data.setStyle((feature: any) =>{
      const geometryType = feature.getGeometry().getType();
      if (geometryType === 'Point') {
        return {
          visible: false
        };
      }
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

    const customIconUrl = 'assets/icons/point.png';

      //evento de click - infoWindow
    map.data.addListener('click', (event: any) => {
      const geometryType = event.feature.getGeometry().getType();
      if (geometryType === 'Point') {
        const position = event.feature.getGeometry().get();
        const marker = new google.maps.Marker({
          position: position,
          icon: customIconUrl,
          map: map
        });

        const content = event.feature.getProperty('Name') || 'Nome não disponível';
        infoWindow.setContent(content);
        infoWindow.setPosition(position);
        infoWindow.open(map);
      }
    });

    this.addMarkers(map);
  }

  async addMarkers(map: google.maps.Map): Promise<void> {
    await this.loadPolygons(map);

    const customIcon = {
      url: 'assets/icons/mosquito.png',
      scaledSize: new google.maps.Size(20, 20)
    };

    this.casos.forEach((item: any) => {
      if (item.latitude && item.longitude) {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        const zona = this.getZonaForLatLng(lat, lng);
        const status = item.status;

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          icon: customIcon,
          map: map
        });

        const infoContent = zona ?
          `<div>Status: ${status}</div><div>Zona: ${zona}</div>` :
          `<div>Status: ${status}</div><div>Zona não determinada</div>`;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        marker.addListener('click', () => {
          const modalData: Modal = {
            endereco: 'Seu endereço aqui',
            lat: lat,
            lng: lng,
            status: status,
            zona: zona || 'Zona não determinada'
          };
          this.showModal(modalData);
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
