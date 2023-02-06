import { Component } from '@angular/core';
import { Firestore, addDoc, deleteDoc, doc, updateDoc, runTransaction, collectionGroup, collectionData } from '@angular/fire/firestore';
import { getObservable } from 'src/app/helpers/getObservable';
import { IBoard, IBoardDialogData } from 'src/app/types/types';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialogComponent, BoardDialogOperation, BoardDialogResult } from 'src/app/components/board-dialog/board-dialog.component';
import { collection } from "firebase/firestore";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  title = 'Main';
  loading = false;
  collectionName = 'boards';
  boards$ = getObservable(collection(this.store, this.collectionName));

  constructor(private store: Firestore, private dialog: MatDialog) {
    // console.log(this.lists);
    console.log(this.boards$)
  }

  openBoardModal(boardId?: string, board?: IBoard): void {
    const boardDialogData: IBoardDialogData = {
      data: {
        board: board ? board : {},
      }
    };
    if (boardId) {
      boardDialogData.data.enableDelete = boardId;
    };

    const dialogRef = this.dialog.open(BoardDialogComponent, boardDialogData);
    dialogRef.afterClosed().subscribe((result: BoardDialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === BoardDialogOperation.create) {
          addDoc(collection(this.store, this.collectionName), result.board);
        } else {
          if (result.board.id && boardId) {
            switch (result.op) {
              case BoardDialogOperation.update:
                updateDoc(doc(this.store, this.collectionName, result.board.id), { ...result.board });
                break;
              case BoardDialogOperation.delete:
                deleteDoc(doc(this.store, this.collectionName, result.board.id));
                break;
              default:
                break;
            }
          }
        }
      }
    });
  }
}