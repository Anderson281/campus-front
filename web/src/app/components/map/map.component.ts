import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import Draw from 'ol/interaction/Draw';
import WKT from 'ol/format/WKT';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';

import { MapService } from '../../services/map.service';

type DrawType = 'Point' | 'LineString' | 'Polygon';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  message = '';
  private activeDraw: Draw | null = null;
  private wktFormat = new WKT();

  constructor(
    public mapService: MapService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.mapService.map.setTarget(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.stopDrawing(false);

    if (this.mapService.map) {
      this.mapService.map.setTarget(undefined);
    }
  }

  startDrawing(drawType: DrawType): void {
    this.stopDrawing(false);

    const drawSource = this.getDrawSource();
    this.activeDraw = new Draw({
      source: drawSource,
      type: drawType
    });

    this.mapService.map.addInteraction(this.activeDraw);
    this.message = this.getStartMessage(drawType);

    this.activeDraw.on('drawend', (event) => {
      const geometry = event.feature.getGeometry();

      if (!geometry) {
        this.message = 'No se pudo leer la geometría dibujada.';
        return;
      }

      const wkt = this.wktFormat.writeGeometry(geometry);
      const target = this.getTargetForm(drawType);

      // Guarda la geometría para que el formulario la lea automáticamente.
      localStorage.setItem(target.storageKey, wkt);

      this.message = `Geometría creada: ${wkt}`;

      // Se espera un instante para que OpenLayers termine de pintar la geometría.
      setTimeout(() => {
        this.stopDrawing(false);
        this.router.navigate([target.route]);
      }, 250);
    });
  }

  stopDrawing(showMessage: boolean = true): void {
    if (this.activeDraw) {
      this.mapService.map.removeInteraction(this.activeDraw);
      this.activeDraw = null;
    }

    if (showMessage) {
      this.message = 'Dibujo detenido.';
    }
  }

  private getDrawSource(): VectorSource {
    const layer = this.mapService.getLayerByTitle('Draw vector') as VectorLayer<any> | undefined;
    const source = layer?.getSource();

    if (!source) {
      throw new Error('No se encontró la capa vectorial Draw vector en MapService.');
    }

    return source as VectorSource;
  }

  private getTargetForm(drawType: DrawType): { storageKey: string; route: string } {
    if (drawType === 'Point') {
      return { storageKey: 'geom_puntos', route: '/puntos' };
    }

    if (drawType === 'LineString') {
      return { storageKey: 'geom_lineas', route: '/lineas' };
    }

    return { storageKey: 'geom_poligonos', route: '/poligonos' };
  }

  private getStartMessage(drawType: DrawType): string {
    if (drawType === 'Point') {
      return 'Haz clic en el mapa para dibujar un punto.';
    }

    if (drawType === 'LineString') {
      return 'Haz clic varias veces para dibujar una línea. Doble clic para terminar.';
    }

    return 'Haz clic varias veces para dibujar un polígono. Doble clic para terminar.';
  }
}
