import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskStackComponent } from './task-stack.component';

describe('TaskStackComponent', () => {
  let component: TaskStackComponent;
  let fixture: ComponentFixture<TaskStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskStackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
