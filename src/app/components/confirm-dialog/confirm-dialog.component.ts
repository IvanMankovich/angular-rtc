import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperationType, DialogData, DialogResult } from 'src/app/types/types';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
})
export class ConfirmDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() modalTitle: string = '';
  @Input() modalDescription: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: DialogResult = {
      ...this.data,
      op: OperationType.delete,
    };
    console.log(result);
    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.item?.title ?? '';
    this.description = this.data.item?.description ?? '';
    this.modalTitle = this.data.modalTitle ?? '';
    this.modalDescription = this.data.modalDescription ?? '';
  }
}
