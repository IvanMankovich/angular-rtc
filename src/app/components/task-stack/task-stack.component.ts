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
  serverTimestamp,
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
import { Collection, DialogResult, IBoard, IDialogData, IList, ITask, OperationType } from 'src/app/types/types';
import { CreateUpdateDialogComponent } from '../create-update-dialog/create-update-dialog.component';
import { Task } from 'src/app/helpers/classes/Task';

@Component({
  selector: 'app-task-stack',
  templateUrl: './task-stack.component.html',
  styleUrls: ['./task-stack.component.css'],
})
export class TaskStackComponent {
  @Input() list: IList & IBoard | null = null;
  @Input() cdkDropListConnectedTo: any = [];
  @Output() edit = new EventEmitter<IList | IBoard>();
  @Output() delete = new EventEmitter<IList | IBoard>();
  @Output() save = new EventEmitter<IList | IBoard>();
  @Input() handleSidebarState!: (content?: IList | IBoard | ITask | null) => void;

  public CollectionNames = Collection;
  public OperationTypes = OperationType;

  constructor(private dialog: MatDialog, private store: Firestore) { }

  openTaskModal(collectionName: Collection, opType: OperationType, list?: ITask): void {
    const listDialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: opType === OperationType.update ? `Edit task ${list?.title}` : `Create new task`,
      },
    };
    if (list) {
      listDialogData.data.enableDelete = list;
    }

    const dialogRef = this.dialog.open(CreateUpdateDialogComponent, listDialogData);
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === OperationType.create && this.list?.id) {
          const newTask = await addDoc(
            collection(this.store, Collection.tasks),
            { ...new Task({ ...result.item, created: serverTimestamp() }) }
          );
          updateDoc(doc(this.store, Collection.lists, this.list?.id), {
            tasks: arrayUnion(newTask.id),
          });
        } else {
          updateDoc(doc(this.store, Collection.tasks, result.item.id), { ...new Task({ ...result.item, updated: serverTimestamp() }) });
        }
      }
    });
  }

  deleteTask(collectionName: Collection, opType: OperationType, item?: ITask): void {
    if (item?.id && this.list?.id) {
      updateDoc(doc(this.store, Collection.lists, this.list.id), {
        tasks: arrayRemove(item.id),
      });
      deleteDoc(doc(this.store, Collection.tasks, item.id));
    }
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
}
