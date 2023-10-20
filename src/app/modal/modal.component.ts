import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Modal} from "./modal";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent{

  @Input() modal!: Modal;
  @Output() closeEvent = new EventEmitter<void>();

  public verifyStatus(){
    const statusColors: any = {
      'suspeito': 'orange',
      'negativo': 'red',
      'positivo': 'green'
    };

    const color = statusColors[this.modal.status];
    if (color) {
      document.getElementById('status')!.style.color = color;
    }
  }

  close(): void {
    this.closeEvent.emit();
  }


}
