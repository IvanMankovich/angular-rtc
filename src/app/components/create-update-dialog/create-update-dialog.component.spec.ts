import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateUpdateDialogComponent } from './create-update-dialog.component';

describe('CreateUpdateDialogComponent', () => {
  let component: CreateUpdateDialogComponent;
  let fixture: ComponentFixture<CreateUpdateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateUpdateDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateUpdateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
