import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  Firestore,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  where,
  documentId,
  getDocs,
  runTransaction,
  writeBatch,
  WriteBatch,
  FieldValue,
  onSnapshot
} from '@angular/fire/firestore';
import { Collection, IBoard, ICardItem, IList, ITask, OperationType } from 'src/app/types/types';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateUpdateDialogComponent } from 'src/app/components/create-update-dialog/create-update-dialog.component';
import { DialogResult, IDialogData } from 'src/app/types/types';
import { Board } from 'src/app/helpers/classes/Board';
import { BoardService } from 'src/app/services/boardService/board.service';
import { map, of } from 'rxjs';
import { ListService } from 'src/app/services/listService/list.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit, OnDestroy {
  title: string = 'Main';
  boards: (IList & IBoard)[] = [];
  loading: boolean = true;
  sidebar: IList | IBoard | ITask | null = null;

  public CollectionNames = Collection;
  public OperationTypes = OperationType;

  constructor(private store: Firestore, private dialog: MatDialog, private boardService: BoardService, private listService: ListService) { }

  async openModal(collectionName: Collection, opType: OperationType.create | OperationType.update, list?: IList | IBoard): Promise<void> {
    const boardDialogData: IDialogData = {
      data: {
        item: list ? (list as IBoard) : {},
        modalTitle: opType === OperationType.update ? `Edit board ${list?.title}` : 'Create new board',
      },
    };

    const dialogRef = this.dialog.open(
      CreateUpdateDialogComponent,
      boardDialogData
    );

    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === OperationType.create) {
          this.boardService.addBoard(result.item);
        } else {
          this.boardService.updateBoard(result.item);
        }
      }
    });
  }

  async openConfirmModal(collectionName: Collection, opType: OperationType, list?: IList | IBoard): Promise<void> {
    const boardDialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: `Remove board`,
        modalDescription: `Are you sure you want to remove board ${list?.title}? All related lists and tasks will be removed.`,
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, boardDialogData);
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (result?.item?.id && result.op === OperationType.delete) {
        // if (result.item?.lists?.length) {
        //   const listsQuery = query(
        //     collection(this.store, Collection.lists),
        //     where(documentId(), 'in', result.item?.lists)
        //   );
        //   const listsQuerySnapshot = await getDocs(listsQuery);
        //   listsQuerySnapshot.forEach(async (curList) => {
        //     const { tasks } = (curList.data() as IList);

        //     if (tasks.length) {
        //       const batch: WriteBatch = writeBatch(this.store);

        //       const tasksQuery = query(
        //         collection(this.store, Collection.tasks),
        //         where(documentId(), 'in', tasks)
        //       );

        //       const tasksQuerySnapshot = await getDocs(tasksQuery);
        //       tasksQuerySnapshot.forEach(doc => batch.delete(doc.ref))
        //       batch.commit();
        //     }

        //     this.listService.deleteList(curList.id);
        //   });
        // }

        this.boardService.deleteBoard(result.item);
      }
    });
  }

  ngOnInit(): void {
    this.boardService.loading.subscribe(value => this.loading = value);
    this.boardService.result.subscribe(value => this.boards = value as (IList & IBoard)[]);
    this.boardService.subscribeOnBoardsChange();
  }

  handleSidebarState(content?: IList | IBoard | ITask | null): void {
    this.sidebar = content ? content : null;
  }

  ngOnDestroy(): void {
    this.boardService.loading.unsubscribe();
    this.boardService.result.unsubscribe();
    this.boardService.unsubscribe();
  }
}
