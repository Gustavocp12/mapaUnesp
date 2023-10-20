import { Component } from '@angular/core';
import {Toolbar} from "./toolbar";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  hidden = false;
  infoView = false;

  toolbar: Toolbar[] = [{
    id: 1,
    label: 'item 1',
    icon: ''
  },
  {
    id: 2,
    label: 'item 2',
    icon: ''
  },
  {
    id: 3,
    label: 'item 3',
    icon: ''
  }];

  hiddenBar(){
    this.hidden = !this.hidden;
  }

  selectInfo(id: number){
    switch (id) {
      case 1:
        break;
      case 2:
        break;
      case 3:
        this.infoView = !this.infoView;
        break;
    }
  }

}
