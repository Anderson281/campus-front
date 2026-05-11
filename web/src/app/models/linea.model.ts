// src/app/models/linea.model.ts
export class LineaModel {
  id: number = 0;
  tipo_via: string = '';
  pavimento: string = '';
  accesible: boolean = true;
  codigo_tramo: string = '';
  observacion: string = '';
  longitud: number = 0;
  geom: string = '';
}
