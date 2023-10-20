import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {CommonModule} from "@angular/common";
import {GoogleMapsModule} from "@angular/google-maps";
import {HttpClientModule} from "@angular/common/http";
import { ModalComponent } from './modal/modal.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { InfoViewComponent } from './toolbar/info-view/info-view.component';

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    ToolbarComponent,
    InfoViewComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    GoogleMapsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
