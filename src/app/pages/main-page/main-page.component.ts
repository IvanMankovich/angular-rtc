import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, deleteDoc, doc, updateDoc, collection, } from '@angular/fire/firestore';
import { IBoard, IBoardDialogData } from 'src/app/types/types';
import { MatDialog } from '@angular/material/dialog';
import { BoardDialogComponent, BoardDialogOperation, BoardDialogResult } from 'src/app/components/board-dialog/board-dialog.component';
import { onSnapshot } from '@firebase/firestore';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  title: string = 'Main';
  collectionName: string = 'boards';
  boards: IBoard[] = [];
  loading: boolean = true;

  constructor(private store: Firestore, private dialog: MatDialog) { }

  async openBoardModal(boardId?: string, board?: IBoard): Promise<void> {
    const boardDialogData: IBoardDialogData = {
      data: {
        board: board ? board : {},
      }
    };
    if (boardId) {
      boardDialogData.data.enableDelete = boardId;
    };

    const dialogRef = this.dialog.open(BoardDialogComponent, boardDialogData);
    dialogRef.afterClosed().subscribe(async (result: BoardDialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === BoardDialogOperation.create) {
          await addDoc(collection(this.store, this.collectionName), result.board);
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

  openBoardConfirmModal(boardId?: string, board?: IBoard): void {
    const boardDialogData: IBoardDialogData = {
      data: {
        board: board ? board : {},
      }
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, boardDialogData);
    dialogRef.afterClosed().subscribe((result: BoardDialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.board.id && boardId) {
          switch (result.op) {
            case BoardDialogOperation.delete:
              deleteDoc(doc(this.store, this.collectionName, result.board.id));
              break;
            default:
              break;
          }
        }
      }
    });
  }

  ngOnInit(): void {
    onSnapshot(
      collection(this.store, this.collectionName),
      (querySnapshot) => {
        const tempBoards: IBoard[] = [];
        querySnapshot.forEach((doc) => {
          tempBoards.push({
            id: doc.id,
            ...doc.data(),
          } as IBoard)
        });
        this.boards = tempBoards;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error(error);
      }
    );
  }
}