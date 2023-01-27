import { Component, OnInit } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog/task-dialog.component';
import { TaskDialogResult } from './task-dialog/task-dialog.component';
import { Observable } from 'rxjs';

import { FireService } from './fire-service.service';
import { Firestore, collectionData, collection, deleteDoc, doc, addDoc, getDocs, DocumentData, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private dialog: MatDialog, private fireService: FireService, private firestore: Firestore) { }

  todo: Task[] = [];
  inProgress: Task[] = [];
  done: Task[] = [];

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

  drop(event: CdkDragDrop<Task[]>): void {
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
        this.fireService.addDoc('todo', result);
      });
  }

  ngOnInit(): void {
    // this.fireService.getCollection('todo').subscribe(todo => {
    //   console.log('asdasd', todo);
    //   this.todo = todo;
    // });
    onSnapshot(
      collection(this.firestore, "todo"),
      (snapshot) => {
        const todo: any[] = [];
        snapshot.forEach((doc) => {
          todo.push({
            id: doc.id,
            ...doc.data()
          });
        });
        this.todo = todo;
      },
      (error) => {
        console.error(error);
      });
    this.fireService.getCollection('inProgress').subscribe(inProgress => this.inProgress = inProgress);
    this.fireService.getCollection('done').subscribe(done => this.done = done);
  }
}