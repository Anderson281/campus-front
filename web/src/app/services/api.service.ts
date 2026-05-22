import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  constructor(
    public settingsService: SettingsService,
    private httpClient: HttpClient
  ) {}

  // this.API_URL = 'http://localhost:8001/';
  //                                        campus/insert/
  get(endPointUrl: string, getParams: HttpParams = new HttpParams({})) {
    return this.httpClient.get<any>(this.settingsService.API_URL + endPointUrl, {
      headers: this.headers,
      responseType: 'json',
      reportProgress: false,
      params: getParams,
      withCredentials: true
    });
  }

  post(endPointUrl: string, postParams: any = {}) {
    const postData = this.generarHttpParamsDesdeObjeto(postParams);
    console.log('endpoint', this.settingsService.API_URL + endPointUrl);
    console.log('postParams', postParams);
    console.log('postData', postData);

    return this.httpClient.post<any>(
      this.settingsService.API_URL + endPointUrl,
      postData,
      {
        headers: this.headers,
        responseType: 'json',
        reportProgress: false,
        withCredentials: true
      }
    );
  }

  private generarHttpParamsDesdeObjeto(data: any): string {
    let params = new HttpParams();
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value !== null && value !== undefined) {
          params = params.set(key, value.toString());
        }
      }
    }
    return params.toString();
  }
}

// id=&description=gg&area=236&geom=polygon((0%200,%201%200,%201%201,%200%200))