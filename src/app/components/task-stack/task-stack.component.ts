import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { Collection, DialogResult, IBoard, IDialogData, IList, ITask, OperationType } from 'src/app/types/types';
import { CreateUpdateDialogComponent } from '../create-update-dialog/create-update-dialog.component';
import { TaskService } from 'src/app/services/taskService/task.service';
import { ListService } from 'src/app/services/listService/list.service';

@Component({
  selector: 'app-task-stack',
  templateUrl: './task-stack.component.html',
  styleUrls: ['./task-stack.component.css'],
})
export class TaskStackComponent {
  @Input() list: IList & IBoard | null = null;
  @Input() cdkDropListConnectedTo: any = [];
  @Output() edit = new EventEmitter<IList | IBoard>();
  @Output() delete = new EventEmitter<IList | IBoard>();
  @Output() save = new EventEmitter<IList | IBoard>();
  @Input() handleSidebarState!: (content?: IList | IBoard | ITask | null) => void;

  public CollectionNames = Collection;
  public OperationTypes = OperationType;

  constructor(private dialog: MatDialog, private taskService: TaskService, private listService: ListService) { }

  openTaskModal(collectionName: Collection, opType: OperationType, list?: ITask): void {
    const listDialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: opType === OperationType.update ? `Edit task ${list?.title}` : `Create new task`,
      },
    };

    const dialogRef = this.dialog.open(CreateUpdateDialogComponent, listDialogData);
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.op === OperationType.create && this.list?.id) {
          await this.taskService.addTask(result.item, this.list?.id);
        } else {
          this.taskService.updateTask(result.item);
        }
      }
    });
  }

  deleteTask(collectionName: Collection, opType: OperationType, item?: ITask): void {
    if (item?.id && this.list?.id) {
      this.taskService.deleteTask(item.id, this.list.id);
    }
  }

  onChange(item: ITask): void {
    this.taskService.changeTaskStatus({ ...item });
  }

  async drop(event: CdkDragDrop<ITask[] | undefined>): Promise<void> {
    if (
      event.previousContainer === event.container ||
      !event.previousContainer.data ||
      !event.container.data
    ) {
      return;
    }
    const item = event.previousContainer.data[event.previousIndex];

    await this.listService.replaceTask(item.id, event.previousContainer.id, event.container.id)

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }
}
