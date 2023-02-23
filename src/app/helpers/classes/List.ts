import { ICardItem } from "src/app/types/types";
import { BaseItem } from "./BaseItem";

export class List extends BaseItem {
  tasks: string[] = [];

  constructor({ id, title, description, created, updated, tasks }: ICardItem) {
    super({ id, title, description, created, updated } as ICardItem);
    if (tasks) {
      this.tasks = tasks;
    }
  }
}