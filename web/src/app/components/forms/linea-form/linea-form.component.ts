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
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatTooltipModule, MatButtonModule, MatCardModule],
  templateUrl: './linea-form.component.html',
  styleUrl: './linea-form.component.scss'
})
export class LineaFormComponent {
  id = new FormControl('');
  tipo_via = new FormControl('', [Validators.required]);
  pavimento = new FormControl('');
  accesible = new FormControl('true', [Validators.required]);
  codigo_tramo = new FormControl('', [Validators.required]);
  observacion = new FormControl('');
  longitud = new FormControl({ value: '', disabled: true });
  geom = new FormControl('', [Validators.required]);

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

  serverMessage = '';
  rows: LineaModel[] = [];

  constructor(private apiService: ApiService) {}

  private endpoint(action: string, id: string | null = null): string {
    return id ? `campus/lineas/${action}/${id}/` : `campus/lineas/${action}/`;
  }

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

  private setMessage(response: ServerAnswerModel) {
    const idText = response.data?.[0]?.id ? ` | id: ${response.data[0].id}` : '';
    this.serverMessage = `${response.message}${idText}`;
  }

  insert() { this.apiService.post(this.endpoint('insert'), this.payload()).subscribe({ next: r => { this.setMessage(r); this.selectAll(); }, error: e => { console.log(e); this.serverMessage = 'Error en insert'; } }); }
  selectAll() { this.apiService.get(this.endpoint('select')).subscribe({ next: r => { this.setMessage(r); this.rows = r.ok ? r.data as LineaModel[] : []; }, error: e => { console.log(e); this.serverMessage = 'Error en selectall'; } }); }

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

  clearForm() { this.controlsGroup.reset({ accesible: 'true' }); this.serverMessage = ''; }
}
