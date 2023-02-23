import { IBoard, IList, ITask, ICardItem } from "src/app/types/types";
import { BaseItem } from "./BaseItem";

export class Board extends BaseItem {
  lists: string[] = [];

  constructor({ id, title, description, created, updated, lists }: ICardItem) {
    super({ id, title, description, created, updated } as ICardItem);
    if (lists) {
      this.lists = lists;
    }
  }
}