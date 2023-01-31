import { Component } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogResult, TaskDialogComponent } from './task-dialog/task-dialog.component';
import { Firestore, CollectionReference, collection, DocumentData, collectionData, addDoc, deleteDoc, doc, updateDoc, runTransaction } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

const getObservable = (collection: CollectionReference<DocumentData>) => {
  const subject = new BehaviorSubject<Task[]>([]);
  collectionData(collection, { idField: 'id' }).subscribe((val: DocumentData[]) => {
    subject.next(val as Task[]);
  });
  return subject;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  todo = getObservable(collection(this.store, 'todo'));
  inProgress = getObservable(collection(this.store, 'inProgress'));
  done = getObservable(collection(this.store, 'done'));

  constructor(private dialog: MatDialog, private store: Firestore) { }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult) => {
        if (!result) {
          return;
        }
        addDoc(collection(this.store, 'todo'), result.task);
      });
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result || !task.id) {
        return;
      }
      if (result.delete) {
        deleteDoc(doc(this.store, list, task.id));
      } else {
        updateDoc(doc(this.store, list, task.id), { task })
      }
    });
  }

  drop(event: CdkDragDrop<Task[] | null>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.previousContainer.data || !event.container.data) {
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