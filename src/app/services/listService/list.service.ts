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
  onSnapshot,
  Unsubscribe,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { List } from 'src/app/helpers/classes/List';
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

  async deleteList(list: IList & IBoard, boardId: string): Promise<void> {
    if (list.tasks.length) {
      this.taskService.deleteTasks(list.tasks);
    }

    runTransaction(this.store, () => {
      const promise = Promise.all([
        deleteDoc(doc(this.store, Collection.lists, list.id)),
        updateDoc(doc(this.store, Collection.boards, boardId), {
          lists: arrayRemove(list.id),
        }),
      ]);
      return promise;
    });
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

  async addList(list: IList & IBoard, boardId: string): Promise<void> {
    const newList = await addDoc(
      collection(this.store, Collection.lists),
      {
        ...new List({
          ...list,
          created: serverTimestamp(),
          tasks: [],
        })
      }
    );

    updateDoc(doc(this.store, Collection.boards, boardId), {
      lists: arrayUnion(newList.id),
    });
  }

  updateList(list: IList & IBoard): void {
    updateDoc(doc(this.store, Collection.lists, list.id), {
      ...new List({
        ...list,
        updated: serverTimestamp(),
      })
    });
  }

  async replaceTask(itemId: string, prevContId: string, curContId: string): Promise<void> {
    await runTransaction(this.store, () => {
      const promise = Promise.all([
        updateDoc(
          doc(this.store, Collection.lists, prevContId),
          {
            tasks: arrayRemove(itemId),
          }
        ),
        updateDoc(doc(this.store, Collection.lists, curContId), {
          tasks: arrayUnion(itemId),
        }),
      ]);
      return promise;
    });
  }
}
