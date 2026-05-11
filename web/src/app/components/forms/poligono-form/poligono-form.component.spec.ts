import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoligonoFormComponent } from './poligono-form.component';

describe('PoligonoFormComponent', () => {
  let component: PoligonoFormComponent;
  let fixture: ComponentFixture<PoligonoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoligonoFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoligonoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
