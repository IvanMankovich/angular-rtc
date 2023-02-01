import { Component } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogResult, TaskDialogComponent, ITaskDialogData, TaskDialogOperation } from './task-dialog/task-dialog.component';
import { Firestore, collection, addDoc, deleteDoc, doc, updateDoc, runTransaction } from '@angular/fire/firestore';
import { getObservable } from './helpers/getObservable'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  todo = getObservable(collection(this.store, List.todo));
  inProgress = getObservable(collection(this.store, List.inProgress));
  done = getObservable(collection(this.store, List.done));
  public ListTypes = List;

  constructor(private dialog: MatDialog, private store: Firestore) { }

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

  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container || !event.previousContainer.data || !event.container.data) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    runTransaction(this.store, () => {
      const promise = Promise.all([
        deleteDoc(doc(this.store, event.previousContainer.id, item.id as string)),
        addDoc(collection(this.store, event.container.id), item),
      ]);
      return promise;
    });
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}

export enum List {
  done = 'done',
  todo = 'todo',
  inProgress = 'inProgress',
}