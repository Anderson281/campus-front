import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { PuntoModel } from '../../../models/punto.model';

@Component({
  selector: 'app-punto-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './punto-form.component.html',
  styleUrl: './punto-form.component.scss'
})
export class PuntoFormComponent {

  // Campos del formulario.
  id = new FormControl('');
  tipo = new FormControl('', [Validators.required]);
  estado = new FormControl('', [Validators.required]);
  material = new FormControl('');
  codigo_inventario = new FormControl('', [Validators.required]);
  observacion = new FormControl('');
  geom = new FormControl('', [Validators.required]);

  // Grupo que conecta todos los FormControl con el formulario HTML.
  controlsGroup = new FormGroup({
    id: this.id,
    tipo: this.tipo,
    estado: this.estado,
    material: this.material,
    codigo_inventario: this.codigo_inventario,
    observacion: this.observacion,
    geom: this.geom
  });

  // Mensaje visible en pantalla.
  serverMessage = '';

  // Filas recuperadas desde Django.
  rows: PuntoModel[] = [];

  constructor(private apiService: ApiService) {}

  // Construye las rutas hacia Django.
  private endpoint(action: string, id: string | null = null): string {
    return id ? `campus/puntos/${action}/${id}/` : `campus/puntos/${action}/`;
  }

  // Prepara los datos del formulario para enviarlos al backend.
  private payload(): any {
    const d = this.controlsGroup.getRawValue();

    return {
      tipo: d.tipo,
      estado: d.estado,
      material: d.material,
      codigo_inventario: d.codigo_inventario,
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

  // Inserta un punto. Si va bien, actualiza la tabla sin borrar el mensaje del insert.
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

  // Consulta todos los puntos.
  // showMessage=true: muestra mensaje cuando el usuario pulsa Select all.
  // showMessage=false: actualiza la tabla sin reemplazar el mensaje anterior.
  selectAll(showMessage: boolean = true) {
    this.apiService.get(this.endpoint('select')).subscribe({
      next: (response: ServerAnswerModel) => {
        if (showMessage) {
          this.setMessage(response);
        }

        this.rows = response.ok ? response.data as PuntoModel[] : [];
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en selectall');
      }
    });
  }

  // Consulta un punto por id y lo carga en el formulario.
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

  // Actualiza un punto. Si va bien, actualiza la tabla sin borrar el mensaje del update.
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

  // Elimina un punto. Conserva el mensaje de delete aunque se limpie el formulario.
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
  fillForm(row: PuntoModel) {
    this.controlsGroup.patchValue({
      id: String(row.id),
      tipo: row.tipo,
      estado: row.estado,
      material: row.material,
      codigo_inventario: row.codigo_inventario,
      observacion: row.observacion,
      geom: row.geom
    });
  }

  // Rellena el formulario con datos de prueba del campus.
  fillCampusData() {
    this.controlsGroup.patchValue({
      id: '',
      tipo: 'Papelera',
      estado: 'Operativo',
      material: 'Metal',
      codigo_inventario: 'PT-BIB-001',
      observacion: 'Papelera junto a Biblioteca Central UPV.',
      geom: 'POINT(728508 4373562)'
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
  }
}