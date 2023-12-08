import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetailProductComponent } from './dialog-detail-product.component';

describe('DialogDetailProductComponent', () => {
  let component: DialogDetailProductComponent;
  let fixture: ComponentFixture<DialogDetailProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDetailProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDetailProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
