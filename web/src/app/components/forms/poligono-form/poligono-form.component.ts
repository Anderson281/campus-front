import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { PoligonoModel } from '../../../models/poligono.model';

@Component({
  selector: 'app-poligono-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './poligono-form.component.html',
  styleUrl: './poligono-form.component.scss'
})
export class PoligonoFormComponent implements OnInit {

  // Campos del formulario.
  id = new FormControl('');
  nombre = new FormControl('', [Validators.required]);
  uso_principal = new FormControl('');
  pisos = new FormControl('');
  estado = new FormControl('');
  observacion = new FormControl('');
  area = new FormControl({ value: '', disabled: true });
  perimetro = new FormControl({ value: '', disabled: true });
  geom = new FormControl('', [Validators.required]);

  // Grupo que conecta todos los FormControl con el formulario HTML.
  controlsGroup = new FormGroup({
    id: this.id,
    nombre: this.nombre,
    uso_principal: this.uso_principal,
    pisos: this.pisos,
    estado: this.estado,
    observacion: this.observacion,
    area: this.area,
    perimetro: this.perimetro,
    geom: this.geom
  });

  // Mensaje visible en pantalla.
  serverMessage = '';

  // Filas recuperadas desde Django.
  rows: PoligonoModel[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadGeomFromMap();
  }

  // Lee la geometría dibujada en el mapa y la coloca en el campo geom.
  private loadGeomFromMap(): void {
    const wkt = localStorage.getItem('geom_poligonos');

    if (wkt) {
      this.geom.setValue(wkt);
      this.geom.markAsDirty();
      this.geom.updateValueAndValidity();
      localStorage.removeItem('geom_poligonos');
      this.serverMessage = 'Geometría de polígono cargada desde el mapa';
    }
  }

  // Construye las rutas hacia Django.
  private endpoint(action: string, id: string | null = null): string {
    return id ? `campus/poligonos/${action}/${id}/` : `campus/poligonos/${action}/`;
  }

  // Prepara los datos del formulario para enviarlos al backend.
  private payload(): any {
    const d = this.controlsGroup.getRawValue();

    return {
      nombre: d.nombre,
      uso_principal: d.uso_principal,
      pisos: d.pisos,
      estado: d.estado,
      observacion: d.observacion,
      geom: d.geom
    };
  }

  // Muestra el mensaje recibido desde Django.
  private setMessage(response: ServerAnswerModel) {
    const idText = response.data?.[0]?.id ? ` | id: ${response.data[0].id}` : '';
    this.serverMessage = `${response.message}${idText}`;
  }

  // Muestra errores HTTP sin perder el mensaje real si Django lo envía.
  private setHttpErrorMessage(error: any, fallback: string) {
    this.serverMessage = error?.error?.message || error?.message || fallback;
  }

  // Inserta un polígono. Si va bien, actualiza la tabla sin borrar el mensaje del insert.
  insert() {
    this.apiService.post(this.endpoint('insert'), this.payload()).subscribe({
      next: (response: ServerAnswerModel) => {
        this.setMessage(response);

        if (response.ok) {
          this.selectAll(false);
        }
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en insert');
      }
    });
  }

  // Consulta todos los polígonos.
  // showMessage=true: muestra mensaje cuando el usuario pulsa Select all.
  // showMessage=false: actualiza la tabla sin reemplazar el mensaje anterior.
  selectAll(showMessage: boolean = true) {
    this.apiService.get(this.endpoint('select')).subscribe({
      next: (response: ServerAnswerModel) => {
        if (showMessage) {
          this.setMessage(response);
        }

        this.rows = response.ok ? response.data as PoligonoModel[] : [];
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en selectall');
      }
    });
  }

  // Consulta un polígono por id y lo carga en el formulario.
  selectOne() {
    if (!this.id.value) {
      this.serverMessage = 'Escribe un id para selectone';
      return;
    }

    this.apiService.get(this.endpoint('select', this.id.value)).subscribe({
      next: (response: ServerAnswerModel) => {
        this.setMessage(response);

        if (response.ok && response.data?.length > 0) {
          this.fillForm(response.data[0]);
        }
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en selectone');
      }
    });
  }

  // Actualiza un polígono. Si va bien, actualiza la tabla sin borrar el mensaje del update.
  update() {
    if (!this.id.value) {
      this.serverMessage = 'Escribe un id para update';
      return;
    }

    this.apiService.post(this.endpoint('update', this.id.value), this.payload()).subscribe({
      next: (response: ServerAnswerModel) => {
        this.setMessage(response);

        if (response.ok) {
          this.selectAll(false);
        }
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en update');
      }
    });
  }

  // Elimina un polígono. Conserva el mensaje de delete aunque se limpie el formulario.
  deleteRow() {
    if (!this.id.value) {
      this.serverMessage = 'Escribe un id para delete';
      return;
    }

    this.apiService.post(this.endpoint('delete', this.id.value), {}).subscribe({
      next: (response: ServerAnswerModel) => {
        this.setMessage(response);

        if (response.ok) {
          const message = this.serverMessage;
          this.clearForm();
          this.serverMessage = message;
          this.selectAll(false);
        }
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en delete');
      }
    });
  }

  // Rellena el formulario con una fila recuperada desde la tabla.
  fillForm(row: PoligonoModel) {
    this.controlsGroup.patchValue({
      id: String(row.id),
      nombre: row.nombre,
      uso_principal: row.uso_principal,
      pisos: String(row.pisos),
      estado: row.estado,
      observacion: row.observacion,
      area: String(row.area),
      perimetro: String(row.perimetro),
      geom: row.geom
    });
  }

  // Rellena el formulario con datos de prueba del campus.
  fillCampusData() {
    this.controlsGroup.patchValue({
      id: '',
      nombre: 'Biblioteca Central UPV - Edificio 4L',
      uso_principal: 'Biblioteca',
      pisos: '4',
      estado: 'Activo',
      observacion: 'Poligono aproximado del entorno de Biblioteca Central UPV.',
      area: '',
      perimetro: '',
      geom: 'POLYGON((728460 4373525, 728558 4373525, 728558 4373605, 728460 4373605, 728460 4373525))'
    });

    this.serverMessage = 'Formulario rellenado con datos UPV';
  }

  // Alias por si tu botón HTML llama fillData().
  fillData() {
    this.fillCampusData();
  }

  // Limpia el formulario y el mensaje.
  clearForm() {
    this.controlsGroup.reset();
    this.serverMessage = '';
    localStorage.removeItem('geom_poligonos');
  }
}