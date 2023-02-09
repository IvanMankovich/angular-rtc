import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { List } from './../../app.component';
import { IList, OperationType } from 'src/app/types/types';

@Component({
  selector: 'app-list-dialog',
  templateUrl: './list-dialog.component.html',
  styleUrls: ['./list-dialog.component.css']
})
export class ListDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() tasks: string[] = [];
  @Input() modalTitle: string = '';
  @Input() modalDescription: string = '';

  public OperationTypes = OperationType;
  constructor(
    public dialogRef: MatDialogRef<ListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {

  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: ListDialogResult = {
      ...this.data,
      item: {
        ...this.data.item,
      },
      op: OperationType.delete,
    }
    this.dialogRef.close(result);
  }

  save(op: OperationType.create | OperationType.update): void {
    const result: ListDialogResult = {
      ...this.data,
      item: {
        ...this.data.item,
        title: this.title,
        description: this.description,
        tasks: this.tasks,
      },
      op: op,
    };

    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.item?.title ?? '';
    this.description = this.data.item?.description ?? '';
    this.tasks = this.data.item?.tasks ?? [];
    this.modalTitle = this.data.modalTitle ?? '';
    this.modalDescription = this.data.modalDescription ?? '';
  }
}

export interface DialogData {
  item: IList;
  enableDelete?: List;
  modalTitle?: string;
  modalDescription?: string;
}

export interface ListDialogResult {
  item: IList;
  op: OperationType;
}

export interface IListDialogData {
  data: {
    item: IList | {},
    enableDelete?: any,
    modalTitle?: string;
    modalDescription?: string;
  }
}
