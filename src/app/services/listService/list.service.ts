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
}
