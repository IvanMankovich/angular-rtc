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
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-update-dialog',
  templateUrl: './create-update-dialog.component.html',
  styleUrls: ['./create-update-dialog.component.css'],
})
export class CreateUpdateDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() modalTitle: string = this.data.modalTitle ?? '';
  @Input() modalDescription: string = this.data.modalDescription ?? '';

  profileForm: FormGroup = new FormGroup({
    title: new FormControl(this.data.item?.title ?? '', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(128),
    ]),
    description: new FormControl(this.data.item?.description ?? '', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(128),
    ]),
  });
  public OperationTypes = OperationType;
  constructor(
    public dialogRef: MatDialogRef<CreateUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

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

  onSubmit(op: OperationType.create | OperationType.update) {
    this.dialogRef.close({
      ...this.data,
      item: {
        ...this.data.item,
        ...this.profileForm.value,
      },
      op: op,
    });
  }
}
