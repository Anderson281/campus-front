import { Component } from '@angular/core';
// Para usar la sintaxis del template @if, @for, ...
import { CommonModule } from '@angular/common';

// Importar en los imports del componente lo siguiente, COSAS PARA LA PLANTILLA
import { ReactiveFormsModule } from '@angular/forms'; // Para usar formularios reactivos
import { MatInputModule } from '@angular/material/input'; // Angular Material debe estar instalado previamente
import { MatTooltip } from '@angular/material/tooltip'; // Para usar tooltips (mensajes emergentes), ROTULOS
import { MatCardModule } from '@angular/material/card'; // Para usar tarjetas visuales tipo card
import { MatButtonModule } from '@angular/material/button'; // Para usar botones de Angular Material

// Para usar controles dentro del componente
// Importar en los imports del componente lo siguiente, COSAS PARA LA PROGRAMACION
import { FormControl } from '@angular/forms'; // Control individual de formulario, CLASE GENERAL PARA DEFINIR CONTROLES, CAJAS DE TEXTO
import { FormGroup, Validators } from '@angular/forms'; // Grupo de controles + validaciones, AGRUPAR CONTROLES Y MANEJARLOS TODOS, Y LOS VALIDADORES ES PARA QUE EN TIEMPO REAL AVISE DE QUE EL DATO NO ES CORRECTO

//importar el servicio para hacer peticiones HTTP al backend, este lo tengo que inyectar
import { ApiService } from '../../../services/api.service';

// Importar el modelo de datos para la BASE DE DATOS de zonas de trabajo, estos son clases de datos
import { ServerAnswerModel } from '../../../models/server-answer.model'; // Importa el modelo de respuesta del servidor
import { WorkAreaModel } from '../../../models/work-areas.model'; // Importa el modelo de área de trabajo

@Component({
  selector: 'app-work-areas',
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, MatTooltip, MatButtonModule,
    MatCardModule], // tambien importamos aqui
  templateUrl: './work-areas.component.html',
  styleUrl: './work-areas.component.scss'
})
export class WorkAreasComponent {

  // Lista donde se guardarán los registros que vienen del backend, para generar la tabla
  public l: WorkAreaModel[] = [];
  message: string = ' ';

  //Form component creation
  id = new FormControl('');
  nombre =  new FormControl('', [Validators.required]);
  descripcion = new FormControl('');
  fecha_creacion = new FormControl('', [Validators.required])
  responsable = new FormControl('');
  estado = new FormControl('');
  area = new FormControl(''); //como se genera automatico, no es necesario que sea requerido
  perimetro = new FormControl(''); //como se genera automatico, no es necesario que sea requerido
  geom = new FormControl('', [Validators.required,Validators.minLength(10)]);

  // Create a form group to eval the data at once, Crea un grupo de formularios para evaluar los datos de una sola vez.
  //todos mis componentes que tengan formularios, todos tienen la propiedad controlsGroup, que es el grupo de controles
  //metemos todos los controles que hemos creado y evaluarlos a la vez
  //esto es una estructura ponemos nombre de campo y ponemos el control que se llama igual a los nombre de los campos
  controlsGroup = new FormGroup({
    id: this.id,
    nombre: this.nombre,
    descripcion: this.descripcion,
    fecha_creacion: this.fecha_creacion,
    responsable: this.responsable,
    estado: this.estado,
    area: this.area,
    perimetro: this.perimetro,
    geom: this.geom
  })

  constructor(public apiService: ApiService) {} //aqui solo va inicializacion

    
  //AQUI SE DEFINEN LO METODOS PARA QUE FUNCIONEN LOS BOTONES DE LA PLANTILLA
  //ejecutamos un metodo de testeo para insertar datos de prueba en el formulario
  Testeo(){
    this.id.setValue('1');
    this.nombre.setValue('Zona de trabajo 1');
    this.descripcion.setValue('Descripcion de la zona de trabajo 1');
    this.fecha_creacion.setValue('2024-01-01');
    this.responsable.setValue('Juan Perez');
    this.estado.setValue('Activo');
    this.geom.setValue('POLYGON((20 20, 20 35, 35 35, 35 20, 20 20))');
  }
  
  insert(){
    console.log('insert'); //console.log es para mostrar en la consola lo que esta entre parentesis

    //se saca los valores con this.nombredelcontrol.value
    var values = {
      nombre: this.nombre.value,
      fecha_creacion: this.fecha_creacion.value,
      geom : this.geom.value,
    }

    //this.apiService.post("work-areas/ZonasTrabajo_view/insert/", values).subscribe({
    this.apiService.post("geodesia/ZonasTrabajo_view/insert/", values).subscribe({
      next: (response: ServerAnswerModel) => { //any es cualquier cosa, pero la respuesta sabemos que es del tipo ServerAnswerModel
        console.log(response.ok);
        console.log(response.message);
        console.log(response.data);
        if (response.ok){
          var row: WorkAreaModel = response.data[0] as WorkAreaModel; //el response esta en la respuesta de servidor, tiene 3 campos, mensaje es un texto, 
          //data es una lista, un array con diferentes diccionarios, cuando yo inserto el array tiene un solo diccionario
          //si hago un selectall el array tiene todas las filas
          //al ser un insert la respuesta sera un array[con un solo diccionario dentro] -->est representa la fila
          this.id.setValue(row.id.toString());
          this.area.setValue(row.area != null ? row.area.toString() : ''); ///row.area.toString()
          this.fecha_creacion.setValue(row.fecha_creacion);
          this.perimetro.setValue(row.perimetro != null ? row.perimetro.toString() : ''); //row.perimetro.toString()
        }
          this.message = response.message;
          //para acceder al id del formulario
      },

      error: error =>{
        console.log(error.description) //esa variable creo que es descricion
        }
    }) //subscribe

  }
  update(){
    this.message = '';

    if (!this.id.value){
      this.message = 'Debes colocar un id';
      return;
    }

    const values = {
      nombre: this.nombre.value,
      descripcion: this.descripcion.value,
      fecha_creacion: this.fecha_creacion.value,
      responsable: this.responsable.value,
      estado: this.estado.value,
      geom: this.geom.value
    };

    this.apiService.post(
      'geodesia/ZonasTrabajo_view/update/' + this.id.value + '/',
      values
    ).subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response', response);

        this.message = response.message;

        if (response.ok){
          this.selectAll();
        }
      },
      error: (error:any) => {
        console.log(error);
        this.message = error.message;
      }
    });
  }

  select(){
    // Limpia el mensaje anterior del servidor
    this.message = '';

    // Muestra en consola todos los valores actuales del formulario
    console.log(this.controlsGroup.value);

    // Valida que el usuario haya escrito un id
    if (!this.id.value){
      console.log('Debes colocar un id');
      this.message = 'Debes colocar un id';
      return; // detiene la función
    }

    // Llama al backend Django usando GET
    // geodesia/ viene porque tu Postman funciona con ese prefijo
    // ZonasTrabajo_view es tu ruta en urls.py
    // selectone es la acción que Django recibirá
    // this.id.value es el id que quieres buscar
    this.apiService.get('geodesia/ZonasTrabajo_view/selectone/' + this.id.value + '/').subscribe({

      // Si Django responde correctamente
      next: (response: ServerAnswerModel) => {

        // Muestra toda la respuesta en consola
        console.log('response', response);

        // Muestra solo el data de la respuesta
        console.log('response.data', response.data);

        // Si la operación salió bien
        if (response.ok){

          // Toma el primer elemento del array data
          // response.data[0] representa la zona encontrada
          var d: WorkAreaModel = response.data[0] as WorkAreaModel;

          // Carga los datos encontrados en el formulario
          this.setDataInForm(d);

          // Limpia la tabla/lista si estabas mostrando un selectAll
          this.clearList();
        }

        // Muestra el mensaje que mandó Django
        this.message = response.message;
      },

      // Si ocurre error HTTP, por ejemplo 404 o 500
      error: (error:any) => {
        console.log(error);
        this.message = error.message;
      }


    });



  }  
  selectAll(){
    this.message=' ';
    this.apiService.get('geodesia/ZonasTrabajo_view/selectall/').subscribe({

      next: response => {
        console.log('response',response)
        this.l = response.data as WorkAreaModel[];
        this.message=response.message;
      },
      error:error=>{
        console.log(error.description)
      }
    })//subscribe
  }

  deleteRow(){
    this.message = '';
    if (!this.id.value){
      this.message = 'Debes colocar un id';
      return;
    }
    this.apiService.post('geodesia/ZonasTrabajo_view/delete/' + this.id.value + '/').subscribe({
      next: (response: ServerAnswerModel) => {
        console.log('response', response);
        if (response.ok){
          this.clearForm();
          this.selectAll();
        }
        this.message = response.message;
      },
      error: (error:any) => {
        console.log(error);
        this.message = error.message;
      }
    });
  }
  
  clearForm(){
    this.controlsGroup.reset();
    console.log('Clear form');
  }

  clearList(){
    // Vacía la lista que usa el @for en el HTML
    this.l = [];
  }  




  // Método para cargar los datos de una fila en el formulario
  setDataInForm(b: WorkAreaModel) {

    this.id.setValue(String(b.id));
    this.nombre.setValue(b.nombre);
    this.descripcion.setValue(b.descripcion);
    this.fecha_creacion.setValue(b.fecha_creacion);
    this.responsable.setValue(b.responsable);
    this.estado.setValue(b.estado);
    this.area.setValue(String(b.area));
    this.perimetro.setValue(String(b.perimetro));
    this.geom.setValue(b.geom);

  }

}
