import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IBoard, IList, ITask } from 'src/app/types/types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() sidebar: IList | IBoard | ITask | null = null;
  @Output() handleSidebarState = new EventEmitter<IList>();
}
