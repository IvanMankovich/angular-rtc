import { IBoard, IList, ITask, ICardItem } from "src/app/types/types";
import {
  FieldValue,
} from '@angular/fire/firestore';

export class BaseItem {
  id?: string;
  title: string;
  description?: string;
  created?: FieldValue;
  updated?: FieldValue;

  constructor({ id, title, description, created, updated }: ICardItem) {
    this.title = title;
    this.description = description;
    this.created = created;
    if (id) {
      this.id = id;
    }
    if (description) {
      this.description = description;
    }
    if (updated) {
      this.updated = updated;
    }
  }
}