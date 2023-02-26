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
import { TaskService } from '../taskService/task.service';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  loading = new BehaviorSubject<boolean>(true);
  error = new BehaviorSubject<string>('');
  result = new BehaviorSubject<IBoard | IList | ITask | (IBoard | IList | ITask)[]>([]);
  unsubscribe!: Unsubscribe;

  constructor(private store: Firestore, private taskService: TaskService) { }

  subscribeOnListsChange(listsIds: string[]): Unsubscribe {
    this.result.next([]);
    const listsQuery = query(
      collection(this.store, Collection.lists),
      where(documentId(), 'in', listsIds)
    );
    return onSnapshot(
      listsQuery,
      (querySnapshot) => {
        const tempLists: (IList & IBoard)[] = [];
        querySnapshot.forEach((doc) => {
          tempLists.push({
            id: doc.id,
            ...doc.data(),
          } as (IList & IBoard));
        });

        this.result.next(tempLists);
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

  deleteList(id: string) {
    deleteDoc(doc(this.store, Collection.lists, id));
  }

  async deleteLists(ids: string[]): Promise<void> {
    const listsQuery = query(
      collection(this.store, Collection.lists),
      where(documentId(), 'in', ids)
    );
    const listsBatch: WriteBatch = writeBatch(this.store);
    const listsQuerySnapshot = await getDocs(listsQuery);
    const tasksIds: string[] = [];
    listsQuerySnapshot.forEach(
      async (list) => {
        const { tasks } = (list.data() as IList);

        if (tasks.length) {
          tasksIds.push(...tasks);
        }
        listsBatch.delete(list.ref);
      }
    );
    listsBatch.commit();

    if (tasksIds.length) {
      this.taskService.deleteTasks(tasksIds);
    }
  }

  async getLists(ids: string[]): Promise<(IList)[]> {
    const listsQuery = query(
      collection(this.store, Collection.lists),
      where(documentId(), 'in', ids)
    );

    const listsQuerySnapshot = await getDocs(listsQuery);

    const tempLists: (IList)[] = [];
    const taskIds: string[] = [];
    listsQuerySnapshot.forEach((doc) => {
      const list = {
        id: doc.id,
        ...doc.data(),
        tasksRefs: [] as ITask[],
      } as (IList);
      tempLists.push(list);
      if (list.tasks?.length) {
        taskIds.push(...list.tasks);
      }
    });

    if (taskIds.length) {
      const tasksList = await this.taskService.getTasks(taskIds);

      const lists: (IList)[] = [...tempLists];
      tempLists.forEach((list, listInd) => {
        lists[listInd].tasksRefs.length = 0;
        list.tasks.forEach((task) => {
          const tt = tasksList.find(
            (tempTask) => tempTask.id === task
          );
          if (tt) {
            lists[listInd].tasksRefs.push(tt);
          }
        });
      });
    }

    return tempLists;
  }
}
