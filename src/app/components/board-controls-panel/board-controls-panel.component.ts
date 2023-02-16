import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IList } from 'src/app/types/types';

@Component({
  selector: 'app-board-controls-panel',
  templateUrl: './board-controls-panel.component.html',
  styleUrls: ['./board-controls-panel.component.css']
})
export class BoardControlsPanelComponent {
  @Input() listsAmount: number | null = null;
  @Input() title: string | undefined;
  @Output() openListModal = new EventEmitter<IList>();
}
