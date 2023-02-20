import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import {
  TaskDialogResult,
  TaskDialogComponent,
  ITaskDialogData,
  TaskDialogOperation,
} from '../task-dialog/task-dialog.component';
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
import { List } from '../../app.component';
import { BehaviorSubject } from 'rxjs';
import { Collection, IBoard, IList, ITask } from 'src/app/types/types';

@Component({
  selector: 'app-task-stack',
  templateUrl: './task-stack.component.html',
  styleUrls: ['./task-stack.component.css'],
})
export class TaskStackComponent implements OnInit {
  @Input() list: IList | null = null;
  @Input() cdkDropListConnectedTo: any = [];
  @Output() edit = new EventEmitter<IList>();
  @Output() delete = new EventEmitter<IList>();
  @Output() save = new EventEmitter<IList>();
  @Input() handleSidebarState!: (content?: IList | IBoard | ITask | null) => void;
  // tasks: ITask[] = [];

  constructor(private dialog: MatDialog, private store: Firestore) { }

  openTaskModal(list?: List, task?: ITask): void {
    const taskDialogData: ITaskDialogData = {
      data: {
        task: task ? task : {},
      },
    };
    if (list) {
      taskDialogData.data.enableDelete = list;
    }

    const dialogRef = this.dialog.open(TaskDialogComponent, taskDialogData);
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === TaskDialogOperation.create) {
          // addDoc(collection(this.store, List.todo), result.task).catch(res => console.log('res', res));
        } else {
          // if (result.task.id && list) {
          //   switch (result.op) {
          //     case TaskDialogOperation.update:
          //       updateDoc(doc(this.store, list, result.task.id), { ...result.task });
          //       break;
          //     case TaskDialogOperation.delete:
          //       deleteDoc(doc(this.store, list, result.task.id));
          //       break;
          //     default:
          //       break;
          //   }
          // }
        }
      }
    });
  }

  drop(event: CdkDragDrop<ITask[] | undefined>): void {
    console.log(
      event.previousContainer === event.container,
      event.previousContainer,
      event.container,
      event.previousContainer.data,
      event.container.data
    );
    if (
      event.previousContainer === event.container ||
      !event.previousContainer.data ||
      !event.container.data
    ) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];
    runTransaction(this.store, () => {
      const promise = Promise.all([
        updateDoc(
          doc(this.store, Collection.lists, event.previousContainer.id),
          {
            tasks: arrayRemove(item.id),
          }
        ),
        updateDoc(doc(this.store, Collection.lists, event.container.id), {
          tasks: arrayUnion(item.id),
        }),
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

  ngOnInit(): void {
    console.log(this.list?.id);
    // if (this.list?.tasks?.length) {
    //   const listsQuery = query(collection(this.store, Collection.tasks), where(documentId(), 'in', this.list?.tasks));
    //   onSnapshot(
    //     listsQuery,
    //     (querySnapshot) => {
    //       const tempLists: ITask[] = [];
    //       querySnapshot.forEach((doc) => {
    //         tempLists.push({
    //           id: doc.id,
    //           ...doc.data(),
    //         } as ITask);
    //       });
    //       this.tasks = tempLists;
    //     },
    //     (error) => {
    //       console.error(error);
    //     }
    //   );
    // }
  }
}

export interface ITaskStack {
  listId: string;
  listName: string;
  listItems: BehaviorSubject<ITask[]>;
}
