import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardControlsPanelComponent } from './board-controls-panel.component';

describe('BoardControlsPanelComponent', () => {
  let component: BoardControlsPanelComponent;
  let fixture: ComponentFixture<BoardControlsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardControlsPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardControlsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
