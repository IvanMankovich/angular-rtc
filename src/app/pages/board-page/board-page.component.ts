import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, addDoc, deleteDoc, updateDoc, collection, } from '@angular/fire/firestore';
import { onSnapshot, query, where, getDocs, doc, DocumentReference, getDoc, documentId, arrayUnion } from '@firebase/firestore';
import { IBoard, IList } from 'src/app/types/types';
import { IListDialogData, ListDialogComponent, ListDialogOperation, ListDialogResult } from 'src/app/components/list-dialog/list-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css']
})
export class BoardPageComponent implements OnInit {
  title = 'Board';
  loading = false;
  collectionName: string = 'boards';
  listsCollectionName: string = 'lists';
  board: IBoard | null = null;
  lists: IList[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Firestore,
    private dialog: MatDialog
  ) { }

  async openListModal(listId?: string, list?: IList): Promise<void> {
    const listDialogData: IListDialogData = {
      data: {
        list: list ? list : {},
      }
    };
    if (listId) {
      listDialogData.data.enableDelete = listId;
    };

    const dialogRef = this.dialog.open(ListDialogComponent, listDialogData);
    dialogRef.afterClosed().subscribe(async (result: ListDialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === ListDialogOperation.create && this.board?.id) {
          console.log(result.list, this.board?.id);
          // create new list
          const newList = await addDoc(collection(this.store, this.listsCollectionName), result.list);
          // update board add listRef to board
          updateDoc(doc(this.store, this.collectionName, this.board.id), {
            lists: arrayUnion(newList.id),
          });
        } else {
          // if (result.list.id && listId) {
          //   switch (result.op) {
          //     case ListDialogOperation.update:
          //       updateDoc(doc(this.store, this.collectionName, result.list.id), { ...result.list });
          //       break;
          //     case ListDialogOperation.delete:
          //       deleteDoc(doc(this.store, this.collectionName, result.list.id));
          //       break;
          //     default:
          //       break;
          //   }
          // }
        }
      }
    });
  }

  openBoardConfirmModal(listId?: string, list?: IList): void {
    const boardDialogData: IListDialogData = {
      data: {
        list: list ? list : {},
      }
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, boardDialogData);
    dialogRef.afterClosed().subscribe((result: ListDialogResult) => {
      console.log(result);
      if (!result) {
        return;
      } else {
        if (result.list.id && listId) {
          switch (result.op) {
            case ListDialogOperation.delete:
              deleteDoc(doc(this.store, this.collectionName, result.list.id));
              break;
            default:
              break;
          }
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const routeParams = this.activatedRoute.snapshot.paramMap;
    const boardIdFromRoute = routeParams.get('boardId') || '';
    this.loading = true;
    if (!boardIdFromRoute) {
      this.loading = false;
      this.router.navigate(['/']);
    } else {
      const currentBoard = doc(this.store, this.collectionName, boardIdFromRoute);
      const boardSnap = await getDoc(currentBoard);

      if (boardSnap.exists()) {
        this.board = {
          id: boardSnap.id,
          ...boardSnap.data(),
        } as IBoard;

        const listsQuery = query(collection(this.store, this.listsCollectionName), where(documentId(), 'in', this.board.lists));
        const querySnapshot = await getDocs(listsQuery);
        const tempLists: IList[] = [];
        querySnapshot.forEach((doc) => {
          tempLists.push({
            id: doc.id,
            ...doc.data(),
          } as IList);
        });
        this.lists = tempLists;
        this.loading = false;
      } else {
        this.loading = false;
        this.router.navigate(['/']);
      }
      this.loading = false;
    }
  }
}
