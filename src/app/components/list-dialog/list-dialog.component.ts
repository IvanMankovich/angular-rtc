import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { List } from './../../app.component';
import { IList } from 'src/app/types/types';

@Component({
  selector: 'app-list-dialog',
  templateUrl: './list-dialog.component.html',
  styleUrls: ['./list-dialog.component.css']
})
export class ListDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() tasks: string[] = [];

  public OperationTypes = ListDialogOperation;
  constructor(
    public dialogRef: MatDialogRef<ListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ListDialogData,
  ) {

  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: ListDialogResult = {
      ...this.data,
      list: {
        ...this.data.list,
      },
      op: ListDialogOperation.delete,
    }
    this.dialogRef.close(result);
  }

  save(op: ListDialogOperation.create | ListDialogOperation.update): void {
    const result: ListDialogResult = {
      ...this.data,
      list: {
        ...this.data.list,
        title: this.title,
        description: this.description,
        tasks: this.tasks,
      },
      op: op,
    };

    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.list.title ?? '';
    this.description = this.data.list.description ?? '';
    this.tasks = this.data.list.tasks ?? [];
  }
}

export interface ListDialogData {
  list: IList;
  enableDelete?: List;
}

export interface ListDialogResult {
  list: IList;
  op: ListDialogOperation;
}

export enum ListDialogOperation {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export interface IListDialogData {
  data: {
    list: IList | {},
    enableDelete?: any,
  }
}
