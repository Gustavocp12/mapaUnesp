import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit{
  title = 'mapaUnesp';

  //referenciar o mapa no html
  @ViewChild('map', {static: false}) gmap!: ElementRef;

  //ciclo de vida que inicializa apos a view ser carregada
  ngAfterViewInit(): void {
    this.mapInitializer();
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
      }
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
        strokeWeight: 1
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
  }
}
