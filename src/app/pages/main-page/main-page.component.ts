import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collection,
} from '@angular/fire/firestore';
import { Collection, IBoard, IList, ITask, OperationType } from 'src/app/types/types';
import { MatDialog } from '@angular/material/dialog';
import { onSnapshot } from '@firebase/firestore';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateUpdateDialogComponent } from 'src/app/components/create-update-dialog/create-update-dialog.component';
import { DialogResult, IDialogData } from 'src/app/types/types';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  title: string = 'Main';
  boards: (IList & IBoard)[] = [];
  loading: boolean = true;
  sidebar: IList | IBoard | ITask | null = null;

  public CollectionNames = Collection;

  constructor(private store: Firestore, private dialog: MatDialog) { }

  async openModal(boardId?: string, board?: IList | IBoard): Promise<void> {
    const boardDialogData: IDialogData = {
      data: {
        item: board ? (board as IBoard) : {},
        modalTitle: boardId ? `Edit board ${board?.title}` : 'Create new board',
      },
    };
    if (boardId) {
      boardDialogData.data.enableDelete = boardId;
    }

    const dialogRef = this.dialog.open(
      CreateUpdateDialogComponent,
      boardDialogData
    );
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === OperationType.create) {
          console.log({
            ...result.item,
            lists: [],
          })
          // await addDoc(collection(this.store, Collection.boards), {
          //   ...result.item,
          //   lists: [],
          // });
        } else {
          if (result.item.id && boardId) {
            switch (result.op) {
              case OperationType.update:
                updateDoc(doc(this.store, Collection.boards, result.item.id), {
                  ...result.item,
                });
                break;
              case OperationType.delete:
                deleteDoc(doc(this.store, Collection.boards, result.item.id));
                break;
              default:
                break;
            }
          }
        }
      }
    });
  }

  openConfirmModal(boardId?: string, board?: IList | IBoard): void {
    const boardDialogData: IDialogData = {
      data: {
        item: board ? board : {},
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, boardDialogData);
    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.item?.id && boardId && result.op === OperationType.delete) {
        deleteDoc(doc(this.store, Collection.boards, result.item.id));
      }
    });
  }

  ngOnInit(): void {
    onSnapshot(
      collection(this.store, Collection.boards),
      (querySnapshot) => {
        const tempBoards: (IList & IBoard)[] = [];
        querySnapshot.forEach((doc) => {
          tempBoards.push({
            id: doc.id,
            ...doc.data(),
          } as (IList & IBoard));
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

  handleSidebarState(content?: IList | IBoard | ITask | null): void {
    this.sidebar = content ? content : null;
  }
}
