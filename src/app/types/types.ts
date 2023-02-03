export interface IBoard {
  id: string;
  boardTitle: string;
  lists: IList[];
}

export interface IList {
  id: string;
  listTitle: string;
  tasks: ITask[];
}

export interface ITask {
  id: string;
  taskTitle: string;
  taskDescription: string;
  complete: boolean;
}