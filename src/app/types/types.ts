export interface IBoard {
  id: string;
  title: string;
  description: string;
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

export interface IBoardDialogData {
  data: {
    board: IBoard | {},
    enableDelete?: string,
  }
}