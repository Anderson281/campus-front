import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawGeomService {

  private polygonKey = 'last_polygon_wkt';

  private polygonWktSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.polygonKey) || ''
  );

  polygonWkt$ = this.polygonWktSubject.asObservable();

  // Guarda la geometría dibujada como WKT
  setPolygonWkt(wkt: string) {
    localStorage.setItem(this.polygonKey, wkt);
    this.polygonWktSubject.next(wkt);
  }

  // Limpia la geometría guardada
  clearPolygonWkt() {
    localStorage.removeItem(this.polygonKey);
    this.polygonWktSubject.next('');
  }
}