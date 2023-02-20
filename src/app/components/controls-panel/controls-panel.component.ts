import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IList } from 'src/app/types/types';

@Component({
  selector: 'app-controls-panel',
  templateUrl: './controls-panel.component.html',
  styleUrls: ['./controls-panel.component.css']
})
export class ControlsPanelComponent {
  @Input() listsAmount: number | null = null;
  @Input() title: string | undefined;
  @Output() openListModal = new EventEmitter<IList>();
  @Output() handleSidebarState = new EventEmitter<IList>();
}
