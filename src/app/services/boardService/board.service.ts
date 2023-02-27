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
  Unsubscribe,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Board } from '../../helpers/classes/Board';
import { Collection, IBoard, IList, ITask } from '../../types/types';
import { AuthService } from '../authService/auth.service';
import { ListService } from '../listService/list.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  loading = new BehaviorSubject<boolean>(true);
  error = new BehaviorSubject<string>('');
  result = new BehaviorSubject<(IList & IBoard) | null>(null);
  results = new BehaviorSubject<(IBoard | IList | ITask)[]>([]);

  unsubscribe!: Unsubscribe;

  constructor(private store: Firestore, private listService: ListService, private authService: AuthService) { }

  subscribeOnBoardsChange(): void {
    if (this.authService.userData?.uid) {
      const listsQuery = query(
        collection(this.store, Collection.boards),
        where('availableFor', 'array-contains', this.authService.userData?.uid as string)
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

          this.results.next(tempBoards);
          this.loading.next(false);
        },
        (error) => {
          this.loading.next(false);
          console.error(error);
        }
      );
    }
  }

  subscribeOnBoardChange(userBoard: string): Unsubscribe {
    this.result.next(null);
    return onSnapshot(
      doc(this.store, Collection.boards, userBoard),
      async (boardQuerySnapshot) => {
        if (boardQuerySnapshot.exists()) {
          this.result.next({
            ...boardQuerySnapshot.data(),
            id: boardQuerySnapshot.id,
          } as (IList & IBoard));
        }
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

  addListsToBoard(boardId: string, listsIds: string[]) {
    updateDoc(doc(this.store, Collection.boards, boardId), {
      lists: arrayUnion(listsIds),
    });
  }

  removeListsFromBoard(boardId: string, listsIds: string[]) {
    updateDoc(doc(this.store, Collection.boards, boardId), {
      lists: arrayRemove(listsIds),
    });
  }
}
