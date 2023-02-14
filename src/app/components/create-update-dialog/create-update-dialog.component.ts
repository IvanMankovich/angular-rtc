import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { List } from './../../app.component';
import {
  IBoard,
  IList,
  OperationType,
  DialogData,
  DialogResult,
} from 'src/app/types/types';

@Component({
  selector: 'app-create-update-dialog',
  templateUrl: './create-update-dialog.component.html',
  styleUrls: ['./create-update-dialog.component.css'],
})
export class CreateUpdateDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() modalTitle: string = '';
  @Input() modalDescription: string = '';

  public OperationTypes = OperationType;
  constructor(
    public dialogRef: MatDialogRef<CreateUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: DialogResult = {
      ...this.data,
      item: {
        ...this.data.item,
      },
      op: OperationType.delete,
    };
    this.dialogRef.close(result);
  }

  save(op: OperationType.create | OperationType.update): void {
    const result: DialogResult = {
      ...this.data,
      item: {
        ...this.data.item,
        title: this.title,
        description: this.description,
      },
      op: op,
    };

    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.item?.title ?? '';
    this.description = this.data.item?.description ?? '';
    this.modalTitle = this.data.modalTitle ?? '';
    this.modalDescription = this.data.modalDescription ?? '';
  }
}
