import { Component } from '@angular/core';
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
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatTooltipModule, MatButtonModule, MatCardModule],
  templateUrl: './poligono-form.component.html',
  styleUrl: './poligono-form.component.scss'
})
export class PoligonoFormComponent {
  id = new FormControl('');
  nombre = new FormControl('', [Validators.required]);
  uso_principal = new FormControl('');
  pisos = new FormControl('');
  estado = new FormControl('');
  observacion = new FormControl('');
  area = new FormControl({ value: '', disabled: true });
  perimetro = new FormControl({ value: '', disabled: true });
  geom = new FormControl('', [Validators.required]);

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

  serverMessage = '';
  rows: PoligonoModel[] = [];

  constructor(private apiService: ApiService) {}

  private endpoint(action: string, id: string | null = null): string {
    return id ? `campus/poligonos/${action}/${id}/` : `campus/poligonos/${action}/`;
  }

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

  private setMessage(response: ServerAnswerModel) {
    const idText = response.data?.[0]?.id ? ` | id: ${response.data[0].id}` : '';
    this.serverMessage = `${response.message}${idText}`;
  }

  insert() { this.apiService.post(this.endpoint('insert'), this.payload()).subscribe({ next: r => { this.setMessage(r); this.selectAll(); }, error: e => { console.log(e); this.serverMessage = 'Error en insert'; } }); }
  selectAll() { this.apiService.get(this.endpoint('select')).subscribe({ next: r => { this.setMessage(r); this.rows = r.ok ? r.data as PoligonoModel[] : []; }, error: e => { console.log(e); this.serverMessage = 'Error en selectall'; } }); }

  selectOne() {
    if (!this.id.value) { this.serverMessage = 'Escribe un id para selectone'; return; }
    this.apiService.get(this.endpoint('select', this.id.value)).subscribe({
      next: r => { this.setMessage(r); if (r.ok && r.data.length > 0) this.fillForm(r.data[0]); },
      error: e => { console.log(e); this.serverMessage = 'Error en selectone'; }
    });
  }

  update() {
    if (!this.id.value) { this.serverMessage = 'Escribe un id para update'; return; }
    this.apiService.post(this.endpoint('update', this.id.value), this.payload()).subscribe({ next: r => { this.setMessage(r); this.selectAll(); }, error: e => { console.log(e); this.serverMessage = 'Error en update'; } });
  }

  deleteRow() {
    if (!this.id.value) { this.serverMessage = 'Escribe un id para delete'; return; }
    this.apiService.post(this.endpoint('delete', this.id.value), {}).subscribe({ next: r => { this.setMessage(r); this.clearForm(); this.selectAll(); }, error: e => { console.log(e); this.serverMessage = 'Error en delete'; } });
  }

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

  clearForm() { this.controlsGroup.reset(); this.serverMessage = ''; }
}
