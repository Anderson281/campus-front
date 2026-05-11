import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  // 1 = local, 2 = dominio/produccion
  public mode = 1;

  public API_URL = '';
  public GEOSERVER_URL = '';
  public WEB_URL = '';

  constructor() {
    if (this.mode === 1) {
      // Usa el puerto real de tu backend. En algunas plantillas es 8888; en tu manual previo era 8001.
      this.API_URL = 'http://localhost:8001/';
      // this.API_URL = 'http://127.0.0.1:8001/';
      this.GEOSERVER_URL = 'http://localhost:7002/geoserver/';
      this.WEB_URL = 'http://localhost:4200/';
    } else if (this.mode === 2) {
      // Cambia esto por tu dominio .com cuando publiques.
      this.API_URL = 'https://api.tudominio.com/';
      this.GEOSERVER_URL = 'https://tudominio.com/geoserver/';
      this.WEB_URL = 'https://tudominio.com/';
    }
  }
}
