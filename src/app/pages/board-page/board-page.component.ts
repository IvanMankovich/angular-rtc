import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, addDoc, deleteDoc, updateDoc, collection, } from '@angular/fire/firestore';
import { onSnapshot, query, where, getDocs, doc, DocumentReference, getDoc, documentId } from '@firebase/firestore';
import { IBoard, IList } from 'src/app/types/types';


@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css']
})
export class BoardPageComponent implements OnInit {
  title = 'Board';
  loading = false;
  collectionName: string = 'boards';
  listsCollectionName: string = 'lists';
  board: IBoard | null = null;
  lists: IList[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Firestore,
  ) { }

  async ngOnInit(): Promise<void> {
    const routeParams = this.activatedRoute.snapshot.paramMap;
    const boardIdFromRoute = routeParams.get('boardId') || '';
    this.loading = true;
    if (!boardIdFromRoute) {
      this.loading = false;
      this.router.navigate(['/']);
    } else {
      const currentBoard = doc(this.store, this.collectionName, boardIdFromRoute);
      const boardSnap = await getDoc(currentBoard);

      if (boardSnap.exists()) {
        this.board = {
          id: boardSnap.id,
          ...boardSnap.data(),
        } as IBoard;

        const listsQuery = query(collection(this.store, this.listsCollectionName), where(documentId(), 'in', this.board.lists));
        const querySnapshot = await getDocs(listsQuery);
        const tempLists: IList[] = [];
        querySnapshot.forEach((doc) => {
          tempLists.push({
            id: doc.id,
            ...doc.data(),
          } as IList);
        });
        this.lists = tempLists;
        this.loading = false;
      } else {
        this.loading = false;
        this.router.navigate(['/']);
      }
      this.loading = false;
    }
  }
}
