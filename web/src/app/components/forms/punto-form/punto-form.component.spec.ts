import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntoFormComponent } from './punto-form.component';

describe('PuntoFormComponent', () => {
  let component: PuntoFormComponent;
  let fixture: ComponentFixture<PuntoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuntoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuntoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
