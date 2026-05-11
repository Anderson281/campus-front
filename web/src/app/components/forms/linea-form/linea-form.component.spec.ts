import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineaFormComponent } from './linea-form.component';

describe('LineaFormComponent', () => {
  let component: LineaFormComponent;
  let fixture: ComponentFixture<LineaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
