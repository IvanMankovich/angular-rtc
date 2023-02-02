import { Component, OnInit } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogResult, TaskDialogComponent, ITaskDialogData, TaskDialogOperation } from './task-dialog/task-dialog.component';
import { Firestore, addDoc, deleteDoc, doc, updateDoc, runTransaction, collectionGroup, collectionData } from '@angular/fire/firestore';
import { getObservable } from './helpers/getObservable';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ITaskStack } from './task-stack/task-stack.component';
import { collection, query, where, onSnapshot } from "firebase/firestore";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  // todo = getObservable(collection(this.store, List.todo));
  // inProgress = getObservable(collection(this.store, List.inProgress));
  // done = getObservable(collection(this.store, List.done));

  // lists = [getObservable(collection(this.store, List.todo)), getObservable(collection(this.store, List.inProgress)), getObservable(collection(this.store, List.done))];
  // lists = [collection(this.store, List.todo), collection(this.store, List.inProgress), of(collection(this.store, List.done))];

  // lists: ITaskStack[] = [{
  //   listId: List.todo,
  //   listName: 'To do',
  //   listItems: getObservable(collection(this.store, List.todo))
  // },
  // {
  //   listId: List.inProgress,
  //   listName: 'In progress',
  //   listItems: getObservable(collection(this.store, List.inProgress))
  // },
  // {
  //   listId: List.done,
  //   listName: 'Done',
  //   listItems: getObservable(collection(this.store, List.done))
  // }];

  // lists$: Observable<ITaskStack[]>;

  users$: Observable<any[]> = collectionData(collection(this.store, 'users'), { idField: 'id' }) as Observable<any[]>;
  tasks$: Observable<any[]> = collectionData(collection(this.store, 'tasks'), { idField: 'id' }) as Observable<any[]>;


  public ListTypes = List;

  constructor(private dialog: MatDialog, private store: Firestore) {
    // console.log(this.lists);
    console.log(this.users$)
  }

  openTaskModal(list?: List, task?: Task): void {
    const taskDialogData: ITaskDialogData = {
      data: {
        task: task ? task : {},
      }
    };
    if (list) {
      taskDialogData.data.enableDelete = list;
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, taskDialogData);
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === TaskDialogOperation.create) {
          addDoc(collection(this.store, List.todo), result.task);
        } else {
          if (result.task.id && list) {
            switch (result.op) {
              case TaskDialogOperation.update:
                updateDoc(doc(this.store, list, result.task.id), { ...result.task });
                break;
              case TaskDialogOperation.delete:
                deleteDoc(doc(this.store, list, result.task.id));
                break;
              default:
                break;
            }
          }
        }
      }
    });
  }

  // drop(event: CdkDragDrop<Task[] | null>): void {
  //   if (event.previousContainer === event.container || !event.previousContainer.data || !event.container.data) {
  //     return;
  //   }
  //   const item = event.previousContainer.data[event.previousIndex];
  //   runTransaction(this.store, () => {
  //     const promise = Promise.all([
  //       deleteDoc(doc(this.store, event.previousContainer.id, item.id as string)),
  //       addDoc(collection(this.store, event.container.id), item),
  //     ]);
  //     return promise;
  //   });
  //   transferArrayItem(
  //     event.previousContainer.data,
  //     event.container.data,
  //     event.previousIndex,
  //     event.currentIndex
  //   );
  // }

  drop(event: CdkDragDrop<BehaviorSubject<Task[]> | null>): void {
    if (event.previousContainer === event.container || !event.previousContainer.data || !event.container.data) {
      return;
    }
    // const item = event.previousContainer.data[event.previousIndex];
    // runTransaction(this.store, () => {
    //   const promise = Promise.all([
    //     deleteDoc(doc(this.store, event.previousContainer.id, item.id as string)),
    //     addDoc(collection(this.store, event.container.id), item),
    //   ]);
    //   return promise;
    // });
    // transferArrayItem(
    //   event.previousContainer.data,
    //   event.container.data,
    //   event.previousIndex,
    //   event.currentIndex
    // );
  }

  async ngOnInit(): Promise<void> {
    let aaa = collection(this.store, List.done);
    // let aaa = await runTransaction(this.store, async () => {
    //   const promise = Promise.all([
    //     collection(this.store, 'todo'),
    //     collection(this.store, 'inProgress'),
    //   ]);
    //   return promise;
    // });

    // console.log(aaa);




    // this.lists$ = [{
    //   listId: List.todo,
    //   listName: 'To do',
    //   listItems: getObservable(collection(this.store, List.todo))
    // },
    // {
    //   listId: List.inProgress,
    //   listName: 'In progress',
    //   listItems: getObservable(collection(this.store, List.inProgress))
    // },
    // {
    //   listId: List.done,
    //   listName: 'Done',
    //   listItems: getObservable(collection(this.store, List.done))
    // }];
  }
}

export enum List {
  done = 'done',
  todo = 'todo',
  inProgress = 'inProgress',
}