import { Component, OnInit } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { TaskDialogResult } from './task-dialog/task-dialog.component';
// import { collection, Firestore, FirestoreModule, getFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { FireService } from './fire-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // item$: Observable<Task[]>;
  constructor(private dialog: MatDialog, private fireService: FireService) {
    // const aaa = collection(firestore, 'todo');
    // this.item$ = collectionData(aaa) as Observable<Task[]>;
    // console.log(this.item$.forEach(a => console.log(a)));
  }
  // todo$ = collectionData(collection(this.firestore, 'todo')) as Observable<Task[]>;
  // inProgress$ = collectionData(collection(this.firestore, 'inProgress')) as Observable<Task[]>;
  // done$ = collectionData(collection(this.firestore, 'done')) as Observable<Task[]>;
  todo: Task[] = [];

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult | undefined) => {
      if (!result) {
        return;
      }
      // if (result.delete) {
      //   this.store.collection(list).doc(task.id).delete();
      // } else {
      //   this.store.collection(list).doc(task.id).update(task);
      // }
    });
  }

  drop(event: CdkDragDrop<Observable<Task[]>>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    // transferArrayItem(
    //   event.previousContainer.data,
    //   event.container.data,
    //   event.previousIndex,
    //   event.currentIndex
    // );
  }

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        // this.store.collection('todo').add({});
      });
  }

  ngOnInit(): void {
    this.fireService.getTodo().subscribe(todo => this.todo = todo);
  }
}