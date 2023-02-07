import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IBoard, OperationType } from 'src/app/types/types';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardDialogData,
  ) { }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: BoardDialogResult = {
      ...this.data,
      board: {
        ...this.data.board,
      },
      op: OperationType.delete,
    }
    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.board.title ?? '';
    this.description = this.data.board.description ?? '';
  }
}

export interface BoardDialogData {
  board: IBoard;
}

export interface BoardDialogResult {
  board: IBoard;
  op: OperationType;
}