import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  addDoc,
  deleteDoc,
  updateDoc,
  collection,
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
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  ITaskDialogData,
  TaskDialogComponent,
  TaskDialogResult,
} from 'src/app/components/task-dialog/task-dialog.component';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css'],
})
export class BoardPageComponent implements OnInit {
  title = 'Board';
  loading = false;
  board: IBoard | null = null;
  lists: IList[] = [];
  sidebar: IList | IBoard | ITask | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Firestore,
    private dialog: MatDialog
  ) { }

  async openListModal(listId?: string, list?: IList): Promise<void> {
    const listDialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: listId ? `Edit list ${list?.title}` : `Create new list`,
      },
    };
    if (listId) {
      listDialogData.data.enableDelete = listId;
    }

    const dialogRef = this.dialog.open(
      CreateUpdateDialogComponent,
      listDialogData
    );
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result || !this.board?.id) {
        return;
      } else {
        if (result.op === OperationType.create) {
          // create new list
          const newList = await addDoc(
            collection(this.store, Collection.lists),
            result.item
          );
          // update board - add listRef to board
          updateDoc(doc(this.store, Collection.boards, this.board.id), {
            lists: arrayUnion(newList.id),
          });
        } else {
          if (result.item.id && listId) {
            switch (result.op) {
              case OperationType.update:
                updateDoc(doc(this.store, Collection.lists, result.item.id), {
                  ...result.item,
                });
                break;
              case OperationType.delete:
                await deleteDoc(
                  doc(this.store, Collection.boards, result.item.id)
                );
                updateDoc(doc(this.store, Collection.boards, this.board.id), {
                  lists: arrayRemove(result.item.id),
                });
                // TODO: delete tasks
                break;
              default:
                break;
            }
          }
        }
      }
    });
  }

  openBoardConfirmModal(listId?: string, list?: IList): void {
    const dialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: `Remove list`,
        modalDescription: `Are you sure you want to remove ${list?.title}?`,
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogData);
    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.item.id && listId && this.board?.id) {
          switch (result.op) {
            case OperationType.delete:
              deleteDoc(doc(this.store, Collection.lists, result.item.id));
              updateDoc(doc(this.store, Collection.boards, this.board.id), {
                lists: arrayRemove(result.item.id),
              });
              // TODO: delete tasks
              break;
            default:
              break;
          }
        }
      }
    });
  }

  // drop(event: CdkDragDrop<IList[] | null>): void {
  //   if (event.previousContainer === event.container || !event.previousContainer.data || !event.container.data) {
  //     return;
  //   }
  //   const item = event.previousContainer.data[event.previousIndex];
  //   // runTransaction(this.store, () => {
  //   //   const promise = Promise.all([
  //   //     deleteDoc(doc(this.store, event.previousContainer.id, item.id as string)),
  //   //     addDoc(collection(this.store, event.container.id), item),
  //   //   ]);
  //   //   return promise;
  //   // });
  //   transferArrayItem(
  //     event.previousContainer.data,
  //     event.container.data,
  //     event.previousIndex,
  //     event.currentIndex
  //   );
  // }

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
        (querySnapshot) => {
          if (querySnapshot.exists()) {
            this.board = {
              ...querySnapshot?.data?.(),
              id: querySnapshot.id,
            } as IBoard;

            if (this.board.lists.length) {
              const listsQuery = query(
                collection(this.store, Collection.lists),
                where(documentId(), 'in', this.board.lists)
              );
              onSnapshot(
                listsQuery,
                (querySnapshot) => {
                  const tempLists: IList[] = [];
                  const taskIds: string[] = [];
                  querySnapshot.forEach((doc) => {
                    const list = {
                      id: doc.id,
                      ...doc.data(),
                      tasksRefs: [] as ITask[],
                      otherListsTasksRefs: [] as ITask[][],
                    } as IList;
                    tempLists.push(list);
                    if (list.tasks?.length) {
                      taskIds.push(...list.tasks);
                    }
                  });
                  if (taskIds.length) {
                    const listsQuery = query(
                      collection(this.store, Collection.tasks),
                      where(documentId(), 'in', taskIds)
                    );
                    onSnapshot(
                      listsQuery,
                      (querySnapshot) => {
                        const tasksList: ITask[] = [];
                        querySnapshot.forEach((doc) => {
                          const list = {
                            id: doc.id,
                            ...doc.data(),
                          } as ITask;
                          tasksList.push(list);
                        });

                        const lists: IList[] = [...tempLists];
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

                        this.lists = lists;
                        console.log(lists);
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
