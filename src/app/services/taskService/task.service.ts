import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  doc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  where,
  documentId,
  getDocs,
  writeBatch,
  WriteBatch,
  onSnapshot,
  Unsubscribe,
  arrayUnion,
  arrayRemove,
  deleteDoc
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Task } from 'src/app/helpers/classes/Task';
import { Collection, IBoard, ICardItem, IList, ITask } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  loading = new BehaviorSubject<boolean>(true);
  error = new BehaviorSubject<string>('');
  results = new BehaviorSubject<IBoard | IList | ITask | (IBoard | IList | ITask)[]>([]);
  unsubscribe!: Unsubscribe;

  constructor(private store: Firestore) { }

  async deleteTasks(ids: string[]): Promise<void> {
    const tasksBatch: WriteBatch = writeBatch(this.store);
    const tasksQuery = query(
      collection(this.store, Collection.tasks),
      where(documentId(), 'in', ids)
    );

    const tasksQuerySnapshot = await getDocs(tasksQuery);
    tasksQuerySnapshot.forEach(task => tasksBatch.delete(task.ref))
    tasksBatch.commit();
  }

  subscribeOnTasksChange(tasksIds: string[]): Unsubscribe {
    this.results.next([]);
    const tasksQuery = query(
      collection(this.store, Collection.tasks),
      where(documentId(), 'in', tasksIds)
    );
    return onSnapshot(
      tasksQuery,
      (tasksQuerySnapshot) => {
        const tempTasks: ITask[] = [];
        tasksQuerySnapshot.forEach((doc) => {
          tempTasks.push({
            id: doc.id,
            ...doc.data(),
          } as ITask);
        });

        this.results.next(tempTasks);
        this.loading.next(false);
      },
      (error) => {
        this.loading.next(false);
        console.error(error);
      }
    );
  }

  async addTask(task: ITask, listId: string): Promise<void> {
    const newTask = await addDoc(
      collection(this.store, Collection.tasks),
      { ...new Task({ ...task, created: serverTimestamp() } as ICardItem) },
    );
    updateDoc(doc(this.store, Collection.lists, listId), {
      tasks: arrayUnion(newTask.id),
    });
  }

  updateTask(task: ITask): void {
    updateDoc(doc(this.store, Collection.tasks, task.id), { ...new Task({ ...task, updated: serverTimestamp() } as ICardItem) });
  }

  deleteTask(taskId: string, listId: string): void {
    updateDoc(doc(this.store, Collection.lists, listId), {
      tasks: arrayRemove(taskId),
    });
    deleteDoc(doc(this.store, Collection.tasks, taskId));
  }

  changeTaskStatus(task: ITask): void {
    updateDoc(doc(this.store, Collection.tasks, task.id), {
      complete: !task.complete,
      updated: serverTimestamp()
    });
  }
}
