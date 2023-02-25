import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  where,
  documentId,
  getDocs,
  runTransaction,
  writeBatch,
  WriteBatch,
  FieldValue,
  onSnapshot,
  Unsubscribe
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Board } from '../../helpers/classes/Board';
import { Collection, IBoard, IList, ITask } from '../../types/types';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  loading = new BehaviorSubject<boolean>(true);
  error = new BehaviorSubject<string>('');
  result = new BehaviorSubject<IBoard | IList | ITask | (IBoard | IList | ITask)[]>([]);
  results = new BehaviorSubject<IBoard | IList | ITask | (IBoard | IList | ITask)[]>([]);
  unsubscribe!: Unsubscribe;

  constructor(private store: Firestore) { }

  subscribeOnBoardsChange(userBoards?: string[]): void {
    const listsQuery = userBoards?.length
      ? query(
        collection(this.store, Collection.boards),
        where(documentId(), 'in', userBoards?.length)
      )
      : query(
        collection(this.store, Collection.boards),
      );
    this.unsubscribe = onSnapshot(
      listsQuery,
      (querySnapshot) => {
        const tempBoards: (IList & IBoard)[] = [];
        querySnapshot.forEach((doc) => {
          tempBoards.push({
            id: doc.id,
            ...doc.data(),
          } as (IList & IBoard));
        });

        this.result.next(tempBoards);
        console.log(tempBoards);
        this.loading.next(false);
      },
      (error) => {
        this.loading.next(false);
        console.error(error);
      }
    );
  }

  addBoard(boardData: IBoard & IList): void {
    addDoc(collection(this.store, Collection.boards), {
      ...new Board({
        ...boardData,
        created: serverTimestamp(),
        lists: [],
      })
    });
  }

  updateBoard(boardData: IBoard & IList): void {
    updateDoc(doc(this.store, Collection.boards, boardData.id), {
      ...new Board({
        ...boardData,
        updated: serverTimestamp(),
      })
    });
  }

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

  async getTasks(ids: string[]): Promise<ITask[]> {
    const tasksQuery = query(
      collection(this.store, Collection.tasks),
      where(documentId(), 'in', ids)
    );

    const tasksQuerySnapshot = await getDocs(tasksQuery);

    const tasksList: ITask[] = [];
    tasksQuerySnapshot.forEach((doc) => {
      const list = {
        id: doc.id,
        ...doc.data(),
      } as ITask;
      tasksList.push(list);
    });

    return tasksList;
  }

  subscribeOnTasksChange(tasksIds: string[]): void {
    const tasksQuery = query(
      collection(this.store, Collection.tasks),
      where(documentId(), 'in', tasksIds)
    );
    this.unsubscribe = onSnapshot(
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
}
