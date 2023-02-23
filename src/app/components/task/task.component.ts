import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ITask } from 'src/app/types/types';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent {
  @Input() task!: ITask;
  @Output() edit = new EventEmitter<ITask>();
  @Output() delete = new EventEmitter<ITask>();
  @Output() showInfo = new EventEmitter<ITask>();
  checked = true;
  panelOpenState = false;
}
