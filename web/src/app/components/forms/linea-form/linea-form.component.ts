import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../../services/api.service';
import { ServerAnswerModel } from '../../../models/server-answer.model';
import { LineaModel } from '../../../models/linea.model';

@Component({
  selector: 'app-linea-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './linea-form.component.html',
  styleUrl: './linea-form.component.scss'
})
export class LineaFormComponent {

  // Campos del formulario.
  id = new FormControl('');
  tipo_via = new FormControl('', [Validators.required]);
  pavimento = new FormControl('');
  accesible = new FormControl('true', [Validators.required]);
  codigo_tramo = new FormControl('', [Validators.required]);
  observacion = new FormControl('');
  longitud = new FormControl({ value: '', disabled: true });
  geom = new FormControl('', [Validators.required]);

  // Grupo que conecta todos los FormControl con el formulario HTML.
  controlsGroup = new FormGroup({
    id: this.id,
    tipo_via: this.tipo_via,
    pavimento: this.pavimento,
    accesible: this.accesible,
    codigo_tramo: this.codigo_tramo,
    observacion: this.observacion,
    longitud: this.longitud,
    geom: this.geom
  });

  // Mensaje visible en pantalla.
  serverMessage = '';

  // Filas recuperadas desde Django.
  rows: LineaModel[] = [];

  constructor(private apiService: ApiService) {}

  // Construye las rutas hacia Django.
  private endpoint(action: string, id: string | null = null): string {
    return id ? `campus/lineas/${action}/${id}/` : `campus/lineas/${action}/`;
  }

  // Prepara los datos del formulario para enviarlos al backend.
  private payload(): any {
    const d = this.controlsGroup.getRawValue();

    return {
      tipo_via: d.tipo_via,
      pavimento: d.pavimento,
      accesible: d.accesible,
      codigo_tramo: d.codigo_tramo,
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

  // Inserta una línea. Si va bien, actualiza la tabla sin borrar el mensaje del insert.
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

  // Consulta todas las líneas.
  // showMessage=true: muestra mensaje cuando el usuario pulsa Select all.
  // showMessage=false: actualiza la tabla sin reemplazar el mensaje anterior.
  selectAll(showMessage: boolean = true) {
    this.apiService.get(this.endpoint('select')).subscribe({
      next: (response: ServerAnswerModel) => {
        if (showMessage) {
          this.setMessage(response);
        }

        this.rows = response.ok ? response.data as LineaModel[] : [];
      },
      error: (error: any) => {
        console.log(error);
        this.setHttpErrorMessage(error, 'Error en selectall');
      }
    });
  }

  // Consulta una línea por id y la carga en el formulario.
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

  // Actualiza una línea. Si va bien, actualiza la tabla sin borrar el mensaje del update.
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

  // Elimina una línea. Conserva el mensaje de delete aunque se limpie el formulario.
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
  fillForm(row: LineaModel) {
    this.controlsGroup.patchValue({
      id: String(row.id),
      tipo_via: row.tipo_via,
      pavimento: row.pavimento,
      accesible: String(row.accesible),
      codigo_tramo: row.codigo_tramo,
      observacion: row.observacion,
      longitud: String(row.longitud),
      geom: row.geom
    });
  }

  // Rellena el formulario con datos de prueba del campus.
  fillCampusData() {
    this.controlsGroup.patchValue({
      id: '',
      tipo_via: 'Camino peatonal',
      pavimento: 'Baldosa',
      accesible: 'true',
      codigo_tramo: 'LN-AGO-BIB-001',
      observacion: 'Eje peatonal aproximado entre Agora, Biblioteca Central y zona Alumni UPV.',
      longitud: '',
      geom: 'LINESTRING(728440 4373627, 728508 4373562, 728343 4373818)'
    });

    this.serverMessage = 'Formulario rellenado con datos UPV';
  }

  // Alias por si tu botón HTML llama fillData().
  fillData() {
    this.fillCampusData();
  }

  // Limpia el formulario y deja accesible en true.
  clearForm() {
    this.controlsGroup.reset({ accesible: 'true' });
    this.serverMessage = '';
  }
}