import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ITask } from 'src/app/types/types';
import { List } from './../../app.component';

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.css'],
})
export class TaskDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';

  public OperationTypes = TaskDialogOperation;
  constructor(
    public dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData,
  ) {

  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: TaskDialogResult = {
      ...this.data,
      task: {
        ...this.data.task,
      },
      op: TaskDialogOperation.delete,
    }
    this.dialogRef.close(result);
  }

  save(op: TaskDialogOperation.create | TaskDialogOperation.update): void {
    const result: TaskDialogResult = {
      ...this.data,
      task: {
        ...this.data.task,
        title: this.title,
        description: this.description,
      },
      op: op,
    }
    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.task.title ?? '';
    this.description = this.data.task.description ?? '';
  }
}

export interface TaskDialogData {
  task: ITask;
  enableDelete?: List;
}

export interface TaskDialogResult {
  task: ITask;
  op: TaskDialogOperation;
}

export enum TaskDialogOperation {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export interface ITaskDialogData {
  data: {
    task: ITask | {},
    enableDelete?: List,
  }
}