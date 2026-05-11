import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HelpComponent } from './components/help/help.component';
import { AboutComponent } from './components/about/about.component';
import { MapComponent } from './components/map/map.component';
import { PuntoFormComponent } from './components/forms/punto-form/punto-form.component';
import { LineaFormComponent } from './components/forms/linea-form/linea-form.component';
import { PoligonoFormComponent } from './components/forms/poligono-form/poligono-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'help', component: HelpComponent },
  { path: 'about', component: AboutComponent },
  { path: 'map', component: MapComponent },
  { path: 'puntos', component: PuntoFormComponent },
  { path: 'lineas', component: LineaFormComponent },
  { path: 'poligonos', component: PoligonoFormComponent },
];
