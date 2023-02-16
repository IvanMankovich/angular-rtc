import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardCardsPanelComponent } from './board-cards-panel.component';

describe('BoardCardsPanelComponent', () => {
  let component: BoardCardsPanelComponent;
  let fixture: ComponentFixture<BoardCardsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardCardsPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardCardsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
