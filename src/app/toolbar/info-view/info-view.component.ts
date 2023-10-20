import {Component, EventEmitter, Output} from '@angular/core';
import {InfoView} from "./info-view";

@Component({
  selector: 'app-info-view',
  templateUrl: './info-view.component.html',
  styleUrls: ['./info-view.component.scss']
})
export class InfoViewComponent {

  @Output() closeInfoView = new EventEmitter<void>();

  zonas: InfoView[] = [{
      zona: 'Norte',
      cor: 'Verde',
    },
    {
      zona: 'Sul',
      cor: 'Vermelho',
    },
    {
      zona: 'Leste',
      cor: 'Amarelo',
    },
    {
      zona: 'Oeste',
      cor: 'Azul',
    }];

  close(){
    this.closeInfoView.emit();
  }

}
