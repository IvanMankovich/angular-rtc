import {
  FieldValue, Timestamp,
} from '@angular/fire/firestore';

export interface IBaseElement {
  id: string;
  title: string;
  description?: string;
  created?: FieldValue | Timestamp;
  updated?: FieldValue | Timestamp;
  availableFor?: string[];
}

export interface IBoard extends IBaseElement {
  lists: string[];
  listsRefs: IList[];
}

export interface IList extends IBaseElement {
  tasks: string[];
  tasksRefs: ITask[];
  otherListsTasksRefs: ITask[][];
}

export interface ITask extends IBaseElement {
  complete?: boolean;
}

export type ICardItem = IBoard & IList & ITask;

export interface DialogData {
  item: IList & IBoard;
  modalTitle?: string;
  modalDescription?: string;
}

export interface DialogResult {
  item: IList & IBoard;
  op: OperationType;
}

export interface IDialogData {
  data: {
    item: IList & IBoard | {};
    enableDelete?: any;
    modalTitle?: string;
    modalDescription?: string;
  };
}

export enum OperationType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export enum Collection {
  boards = 'boards',
  tasks = 'tasks',
  lists = 'lists',
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}