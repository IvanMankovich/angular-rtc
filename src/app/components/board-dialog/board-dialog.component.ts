import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { List } from './../../app.component';
import { Task } from '../task/task';
import { IBoard, IList } from 'src/app/types/types';

@Component({
  selector: 'app-board-dialog',
  templateUrl: './board-dialog.component.html',
  styleUrls: ['./board-dialog.component.css']
})
export class BoardDialogComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() lists: string[] = [];

  public OperationTypes = BoardDialogOperation;
  constructor(
    public dialogRef: MatDialogRef<BoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardDialogData,
  ) {

  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    const result: BoardDialogResult = {
      ...this.data,
      board: {
        ...this.data.board,
      },
      op: BoardDialogOperation.delete,
    }
    this.dialogRef.close(result);
  }

  save(op: BoardDialogOperation.create | BoardDialogOperation.update): void {
    const result: BoardDialogResult = {
      ...this.data,
      board: {
        ...this.data.board,
        title: this.title,
        description: this.description,
        lists: this.lists,
      },
      op: op,
    };

    this.dialogRef.close(result);
  }

  ngOnInit() {
    this.title = this.data.board.title ?? '';
    this.description = this.data.board.description ?? '';
    this.lists = this.data.board.lists ?? [];
  }
}

export interface BoardDialogData {
  board: IBoard;
  enableDelete?: List;
}

export interface BoardDialogResult {
  board: IBoard;
  op: BoardDialogOperation;
}

export enum BoardDialogOperation {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export interface IBoardDialogData {
  data: {
    board: IBoard | {},
    enableDelete?: List,
  }
}