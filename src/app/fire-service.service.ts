import { Injectable, OnInit } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from './task/task';

@Injectable({
  providedIn: 'root'
})
export class FireService {
  constructor(private firestore: Firestore) { }

  getTodo(): Observable<Task[]> {
    return collectionData(collection(this.firestore, 'todo')) as Observable<Task[]>;
  }
}
