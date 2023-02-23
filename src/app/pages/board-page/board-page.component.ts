import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
  writeBatch,
  WriteBatch,
  getDocs,
  serverTimestamp
} from '@angular/fire/firestore';
import {
  onSnapshot,
  query,
  where,
  doc,
  documentId,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from '@firebase/firestore';
import {
  Collection,
  IBoard,
  IList,
  OperationType,
  DialogResult,
  IDialogData,
  ITask,
} from 'src/app/types/types';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateUpdateDialogComponent } from 'src/app/components/create-update-dialog/create-update-dialog.component';
import { List } from 'src/app/helpers/classes/List';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css'],
})
export class BoardPageComponent implements OnInit {
  title = 'Board';
  loading = false;
  board?: IList & IBoard;
  lists: (IList & IBoard)[] = [];
  sidebar: IList | IBoard | ITask | null = null;

  public CollectionNames = Collection;
  public OperationTypes = OperationType;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Firestore,
    private dialog: MatDialog
  ) { }

  async openModal(collectionName: Collection, opType: OperationType.create | OperationType.update, list?: IList | IBoard): Promise<void> {
    const listDialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: opType === OperationType.update ? `Edit list ${list?.title}` : `Create new list`,
      },
    };

    const dialogRef = this.dialog.open(
      CreateUpdateDialogComponent,
      listDialogData
    );
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result || !this.board?.id) {
        return;
      } else {
        if (result.op === OperationType.create) {
          const newList = await addDoc(
            collection(this.store, Collection.lists),
            {
              ...new List({
                ...result.item,
                created: serverTimestamp(),
                tasks: [],
              })
            }
          );
          updateDoc(doc(this.store, Collection.boards, this.board.id), {
            lists: arrayUnion(newList.id),
          });
        } else {
          updateDoc(doc(this.store, Collection.lists, result.item.id), {
            ...new List({
              ...result.item,
              updated: serverTimestamp(),
            })
          });
        }
      }
    });
  }

  openConfirmModal(collectionName: Collection, opType: OperationType, list?: IList | IBoard): void {
    const dialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: `Remove list`,
        modalDescription: `Are you sure you want to remove ${list?.title}?`,
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogData);
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.item.id && list?.id && this.board?.id) {
          if (result.item.tasks.length) {
            const batch: WriteBatch = writeBatch(this.store);

            const tasksQuery = query(
              collection(this.store, Collection.tasks),
              where(documentId(), 'in', result.item.tasks)
            );

            const tasksQuerySnapshot = await getDocs(tasksQuery);
            tasksQuerySnapshot.forEach(doc => batch.delete(doc.ref))
            batch.commit();
          }

          runTransaction(this.store, () => {
            const promise = Promise.all([
              deleteDoc(doc(this.store, Collection.lists, result.item.id)),
              updateDoc(doc(this.store, Collection.boards, this.board!.id), {
                lists: arrayRemove(result.item.id),
              }),
            ]);
            return promise;
          });
        }
      }
    });
  }

  ngOnInit(): void {
    const routeParams = this.activatedRoute.snapshot.paramMap;
    const boardIdFromRoute = routeParams.get('boardId') || '';
    this.loading = true;
    if (!boardIdFromRoute) {
      this.loading = false;
      this.router.navigate(['/']);
    } else {
      onSnapshot(
        doc(this.store, Collection.boards, boardIdFromRoute),
        (boardsQuerySnapshot) => {
          if (boardsQuerySnapshot.exists()) {
            this.board = {
              ...boardsQuerySnapshot?.data?.(),
              id: boardsQuerySnapshot.id,
            } as (IList & IBoard);

            if (this.board.lists.length) {
              const listsQuery = query(
                collection(this.store, Collection.lists),
                where(documentId(), 'in', this.board.lists)
              );
              onSnapshot(
                listsQuery,
                (listsQuerySnapshot) => {
                  const tempLists: (IList & IBoard)[] = [];
                  const taskIds: string[] = [];
                  listsQuerySnapshot.forEach((doc) => {
                    const list = {
                      id: doc.id,
                      ...doc.data(),
                      tasksRefs: [] as ITask[],
                      otherListsTasksRefs: [] as ITask[][],
                    } as (IList & IBoard);
                    tempLists.push(list);
                    if (list.tasks?.length) {
                      taskIds.push(...list.tasks);
                    }
                  });
                  if (taskIds.length) {
                    const tasksQuery = query(
                      collection(this.store, Collection.tasks),
                      where(documentId(), 'in', taskIds)
                    );
                    onSnapshot(
                      tasksQuery,
                      (tasksQuerySnapshot) => {
                        const tasksList: ITask[] = [];
                        tasksQuerySnapshot.forEach((doc) => {
                          const list = {
                            id: doc.id,
                            ...doc.data(),
                          } as ITask;
                          tasksList.push(list);
                        });

                        const lists: (IList & IBoard)[] = [...tempLists];
                        console.log(JSON.stringify(lists));
                        tempLists.forEach((list, listInd) => {
                          list.tasks.forEach((task) => {
                            const tt = tasksList.find(
                              (tempTask) => tempTask.id === task
                            );
                            if (tt) {
                              lists[listInd].tasksRefs.push(tt);
                            }
                          });
                        });

                        console.log(JSON.stringify(lists));

                        this.lists = lists;
                        this.loading = false;
                      },
                      (error) => {
                        this.loading = false;
                        console.error(error);
                      }
                    );
                  } else {
                    this.lists = tempLists;
                    this.loading = false;
                  }
                },
                (error) => {
                  this.loading = false;
                  console.error(error);
                }
              );
            } else {
              this.loading = false;
            }
          } else {
            this.loading = false;
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.loading = false;
          console.error(error);
        }
      );
    }
  }

  getListsConnectedTo(id?: string): string[] {
    return this.lists.filter((list) => list.id !== id).map((l) => l.id);
  }

  handleSidebarState(content?: IList | IBoard | ITask | null): void {
    this.sidebar = content ? content : null;
  }
}
