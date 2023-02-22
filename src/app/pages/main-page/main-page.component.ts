import { Component, OnInit } from '@angular/core';
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
  WriteBatch
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
  public OperationTypes = OperationType;

  constructor(private store: Firestore, private dialog: MatDialog) { }

  async openModal(collectionName: Collection, opType: OperationType, list?: IList | IBoard): Promise<void> {
    console.log(collectionName, opType, list);
    const boardDialogData: IDialogData = {
      data: {
        item: list ? (list as IBoard) : {},
        modalTitle: opType === OperationType.update ? `Edit board ${list?.title}` : 'Create new board',
      },
    };
    if (list?.id) {
      boardDialogData.data.enableDelete = list?.id;
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
          await addDoc(collection(this.store, Collection.boards), {
            ...result.item,
            created: serverTimestamp(),
            lists: [],
          });
        } else {
          if (result.item.id && list?.id) {
            switch (result.op) {
              case OperationType.update:
                updateDoc(doc(this.store, Collection.boards, result.item.id), {
                  ...result.item,
                  updated: serverTimestamp(),
                });
                break;
              case OperationType.delete:
                if (result.item?.lists?.length) {
                  const listsQuery = query(
                    collection(this.store, Collection.lists),
                    where(documentId(), 'in', result.item?.lists)
                  );
                  const listsQuerySnapshot = await getDocs(listsQuery);
                  listsQuerySnapshot.forEach(async (curList) => {
                    const { tasks } = (curList.data() as IList);

                    if (tasks.length) {
                      const batch: WriteBatch = writeBatch(this.store);

                      const tasksQuery = query(
                        collection(this.store, Collection.tasks),
                        where(documentId(), 'in', tasks)
                      );

                      const tasksQuerySnapshot = await getDocs(tasksQuery);
                      tasksQuerySnapshot.forEach(doc => batch.delete(doc.ref))
                      batch.commit();
                    }

                    deleteDoc(doc(this.store, Collection.lists, curList.id));
                  });
                } else {
                  deleteDoc(doc(this.store, Collection.boards, result.item.id));
                }
                // if lists get lists
                // get tasks
                // if tasks - delete tasks
                // 
                // remove tasks
                // remove lists
                // deleteDoc(doc(this.store, Collection.boards, result.item.id));
                break;
              default:
                break;
            }
          }
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
        if (result.item?.lists?.length) {
          const listsQuery = query(
            collection(this.store, Collection.lists),
            where(documentId(), 'in', result.item?.lists)
          );
          const listsQuerySnapshot = await getDocs(listsQuery);
          listsQuerySnapshot.forEach(async (curList) => {
            const { tasks } = (curList.data() as IList);

            if (tasks.length) {
              const batch: WriteBatch = writeBatch(this.store);

              const tasksQuery = query(
                collection(this.store, Collection.tasks),
                where(documentId(), 'in', tasks)
              );

              const tasksQuerySnapshot = await getDocs(tasksQuery);
              tasksQuerySnapshot.forEach(doc => batch.delete(doc.ref))
              batch.commit();
            }

            deleteDoc(doc(this.store, Collection.lists, curList.id));
          });
        }
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
