import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {CasesService} from "./services/cases.service";
import {Modal} from "./modal/modal";
import {ModalComponent} from "./modal/modal.component";
import {ReturnZoneService} from "./services/return-zone.service";
import * as mapConfig from './mapConfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{

  constructor(private authService: AuthService, private casesService: CasesService, private returnZoneService: ReturnZoneService) {}

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

  @ViewChild('map', {static: false}) gmap!: ElementRef;
  @ViewChild('modal', {static: false}) modal!: ModalComponent;

  ngOnInit() {
    this.login();
  }

  private showModal(data: Modal): void {
    this.Modalitens = data;
    this.showModalFlag = true;
    setTimeout(() => {
      this.modal.verifyStatus();
    }, 0);
  }

  private loadAndProcessGeoJson(map: google.maps.Map, url: string): void {
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
              icon: mapConfig.customIconUrlPoint,
              map: map
            });

            marker.addListener('click', () => {
              const content = feature.properties.Name || 'Nome não disponível';
              this.openInfoWindow(map, content, position, marker);
            });
          }
        });
      });
    this.loadComplete = true;
  }


  private mapInitializer(): void {
    const mapOptions: google.maps.MapOptions = {
      center: mapConfig.coordinates,
      fullscreenControl: false,
      zoom: 13,
      styles: mapConfig.mapStyles,
      restriction: {
        latLngBounds: mapConfig.allowedBounds,
        strictBounds: true
     }
    };

    const map = new google.maps.Map(this.gmap.nativeElement, mapOptions);
    this.loadAndProcessGeoJson(map, mapConfig.urlMap);
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

    map.data.addListener('click', (event: any) => {
      const geometryType = event.feature.getGeometry().getType();
      if (geometryType === 'Point') {
        const position = event.feature.getGeometry().get();

        const content = event.feature.getProperty('Name') || 'Nome não disponível';
        this.openInfoWindow(map, content, position);
      }
    });

    this.addMarkers(map);
  }

  private async addMarkers(map: google.maps.Map): Promise<void> {
    await this.returnZoneService.loadPolygons(map);

    const customIcon = {
      url: mapConfig.customIconUrlMosquito,
      scaledSize: new google.maps.Size(20, 20)
    };

    this.casos.forEach((item: any) => {
      if (item.latitude && item.longitude) {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);

        const zona = this.returnZoneService.getZonaForLatLng(lat, lng);
        const status = item.status;

        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          icon: customIcon,
          map: map
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

  private openInfoWindow(map: google.maps.Map, content: string, position: google.maps.LatLng, anchor?: google.maps.MVCObject): void {
    const infoWindow = new google.maps.InfoWindow({
      content: content,
      position: position
    });
    infoWindow.open(map, anchor);
  }



}
