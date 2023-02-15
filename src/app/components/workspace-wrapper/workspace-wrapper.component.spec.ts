import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceWrapperComponent } from './workspace-wrapper.component';

describe('WorkspaceWrapperComponent', () => {
  let component: WorkspaceWrapperComponent;
  let fixture: ComponentFixture<WorkspaceWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
