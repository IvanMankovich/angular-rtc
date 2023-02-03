import { Component } from '@angular/core';
import { collectionData, collection, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getObservable } from 'src/app/helpers/getObservable';
import { IBoard } from 'src/app/types/types';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  title = 'Main';
  loading = false;
  boards$ = getObservable(collection(this.store, 'todo'));

  constructor(private store: Firestore) {
    // console.log(this.lists);
    console.log(this.boards$)
  }
}