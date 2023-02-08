export interface IBoard {
  id: string;
  title: string;
  description: string;
  lists: string[];
}

export interface IList {
  id: string;
  title: string;
  description?: string;
  tasks: string[];
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

export enum OperationType {
  create = 'create',
  update = 'update',
  delete = 'delete',
}