import { CollectionReference, DocumentData, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { IBoard } from '../types/types';

export const getObservable = (collection: CollectionReference<DocumentData>): BehaviorSubject<IBoard[]> => {
  const subject = new BehaviorSubject<IBoard[]>([]);
  collectionData(collection, { idField: 'id' }).subscribe((val: DocumentData[]) => {
    subject.next(val as IBoard[]);
  });
  return subject;
};