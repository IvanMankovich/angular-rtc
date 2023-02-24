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
import { ListService } from '../listService/list.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  loading = new BehaviorSubject<boolean>(true);
  error = new BehaviorSubject<string>('');
  result = new BehaviorSubject<IBoard | IList | ITask | (IBoard | IList | ITask)[]>([]);
  unsubscribe!: Unsubscribe;

  constructor(private store: Firestore, private listService: ListService) { }

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

  deleteBoard(board: IList & IBoard) {
    if (board.lists?.length) {
      this.listService.deleteLists(board.lists);
    }

    deleteDoc(doc(this.store, Collection.boards, board.id));
  }
}