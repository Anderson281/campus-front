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
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatTooltipModule, MatButtonModule, MatCardModule],
  templateUrl: './punto-form.component.html',
  styleUrl: './punto-form.component.scss'
})
export class PuntoFormComponent {
  id = new FormControl('');
  tipo = new FormControl('', [Validators.required]);
  estado = new FormControl('', [Validators.required]);
  material = new FormControl('');
  codigo_inventario = new FormControl('', [Validators.required]);
  observacion = new FormControl('');
  geom = new FormControl('', [Validators.required]);

  controlsGroup = new FormGroup({
    id: this.id,
    tipo: this.tipo,
    estado: this.estado,
    material: this.material,
    codigo_inventario: this.codigo_inventario,
    observacion: this.observacion,
    geom: this.geom
  });

  serverMessage = '';
  rows: PuntoModel[] = [];

  constructor(private apiService: ApiService) {}

  private endpoint(action: string, id: string | null = null): string {
    return id ? `campus/puntos/${action}/${id}/` : `campus/puntos/${action}/`;
  }

  private payload(): any {
    const d = this.controlsGroup.value;
    return {
      tipo: d.tipo,
      estado: d.estado,
      material: d.material,
      codigo_inventario: d.codigo_inventario,
      observacion: d.observacion,
      geom: d.geom
    };
  }

  private setMessage(response: ServerAnswerModel) {
    const idText = response.data?.[0]?.id ? ` | id: ${response.data[0].id}` : '';
    this.serverMessage = `${response.message}${idText}`;
  }

  insert() {
    this.apiService.post(this.endpoint('insert'), this.payload()).subscribe({
      next: (response: ServerAnswerModel) => { this.setMessage(response); this.selectAll(); },
      error: (error: any) => { console.log(error); this.serverMessage = 'Error en insert'; }
    });
  }

  selectOne() {
    if (!this.id.value) { this.serverMessage = 'Escribe un id para selectone'; return; }
    this.apiService.get(this.endpoint('select', this.id.value)).subscribe({
      next: (response: ServerAnswerModel) => {
        this.setMessage(response);
        if (response.ok && response.data.length > 0) this.fillForm(response.data[0]);
      },
      error: (error: any) => { console.log(error); this.serverMessage = 'Error en selectone'; }
    });
  }

  selectAll() {
    this.apiService.get(this.endpoint('select')).subscribe({
      next: (response: ServerAnswerModel) => {
        this.setMessage(response);
        this.rows = response.ok ? response.data as PuntoModel[] : [];
      },
      error: (error: any) => { console.log(error); this.serverMessage = 'Error en selectall'; }
    });
  }

  update() {
    if (!this.id.value) { this.serverMessage = 'Escribe un id para update'; return; }
    this.apiService.post(this.endpoint('update', this.id.value), this.payload()).subscribe({
      next: (response: ServerAnswerModel) => { this.setMessage(response); this.selectAll(); },
      error: (error: any) => { console.log(error); this.serverMessage = 'Error en update'; }
    });
  }

  deleteRow() {
    if (!this.id.value) { this.serverMessage = 'Escribe un id para delete'; return; }
    this.apiService.post(this.endpoint('delete', this.id.value), {}).subscribe({
      next: (response: ServerAnswerModel) => { this.setMessage(response); this.clearForm(); this.selectAll(); },
      error: (error: any) => { console.log(error); this.serverMessage = 'Error en delete'; }
    });
  }

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

  clearForm() {
    this.controlsGroup.reset();
    this.serverMessage = '';
  }
}
