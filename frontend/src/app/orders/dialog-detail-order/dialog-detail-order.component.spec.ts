import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetailOrderComponent } from './dialog-detail-order.component';

describe('DialogDetailOrderComponent', () => {
  let component: DialogDetailOrderComponent;
  let fixture: ComponentFixture<DialogDetailOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDetailOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDetailOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
