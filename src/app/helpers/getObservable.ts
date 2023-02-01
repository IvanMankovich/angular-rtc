import { Task } from '../task/task';
import { CollectionReference, DocumentData, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export const getObservable = (collection: CollectionReference<DocumentData>): BehaviorSubject<Task[]> => {
  const subject = new BehaviorSubject<Task[]>([]);
  collectionData(collection, { idField: 'id' }).subscribe((val: DocumentData[]) => {
    subject.next(val as Task[]);
  });
  return subject;
};