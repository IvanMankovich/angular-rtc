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

export interface DialogData {
  item: IList | IBoard;
  modalTitle?: string;
  modalDescription?: string;
}

export interface DialogResult {
  item: IList | IBoard;
  op: OperationType;
}

export interface IDialogData {
  data: {
    item: IList | IBoard | {},
    enableDelete?: any,
    modalTitle?: string;
    modalDescription?: string;
  }
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