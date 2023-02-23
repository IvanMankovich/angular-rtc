import { ICardItem } from "src/app/types/types";
import { BaseItem } from "./BaseItem";

export class Task extends BaseItem {
  complete: boolean = false;

  constructor({ id, title, description, created, updated, complete = false }: ICardItem) {
    super({ id, title, description, created, updated } as ICardItem);
    if (complete !== undefined) {
      this.complete = complete;
    }
  }
}