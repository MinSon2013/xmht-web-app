import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetailNotifyComponent } from './dialog-detail-notify.component';

describe('DialogDetailNotifyComponent', () => {
  let component: DialogDetailNotifyComponent;
  let fixture: ComponentFixture<DialogDetailNotifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDetailNotifyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDetailNotifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
