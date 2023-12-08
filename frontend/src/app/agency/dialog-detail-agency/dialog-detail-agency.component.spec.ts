import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDetailAgencyComponent } from './dialog-detail-agency.component';

describe('DialogDetailAgencyComponent', () => {
  let component: DialogDetailAgencyComponent;
  let fixture: ComponentFixture<DialogDetailAgencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDetailAgencyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogDetailAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
