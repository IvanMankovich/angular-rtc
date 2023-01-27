import { Injectable, OnInit } from '@angular/core';
import { Firestore, collectionData, collection, deleteDoc, doc, addDoc, getDocs, DocumentData, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from './task/task';

@Injectable({
  providedIn: 'root'
})
export class FireService {
  constructor(private firestore: Firestore) { }

  getCollection(collectionName: string): Observable<Task[]> {
    return collectionData(collection(this.firestore, collectionName)) as Observable<Task[]>;
  }

  async getDocsAsync() {
    const querySnapshot = await getDocs(collection(this.firestore, "todo"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`);
    });
  }

  async getData() {
    await onSnapshot(
      collection(this.firestore, "todo"),
      (snapshot) => {
        const todo: any[] = [];
        snapshot.forEach((doc) => {
          todo.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log(todo);
        return todo;
      },
      (error) => {
        console.error(error);
      });
  }

  async deleteItemFromCollection(collectionName: string, docRef: any): Promise<void> {
    await deleteDoc(doc(this.firestore, collectionName, docRef));
  }

  async addDoc(collectionName: string, doc: DocumentData): Promise<void> {
    console.log(doc);
    try {
      const docRef = await addDoc(collection(this.firestore, collectionName), doc);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
}
