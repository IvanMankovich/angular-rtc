import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Collection,
  IBoard,
  IList,
  OperationType,
  DialogResult,
  IDialogData,
  ITask,
} from 'src/app/types/types';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/components/confirm-dialog/confirm-dialog.component';
import { CreateUpdateDialogComponent } from 'src/app/components/create-update-dialog/create-update-dialog.component';
import { BoardService } from 'src/app/services/boardService/board.service';
import { ListService } from 'src/app/services/listService/list.service';
import { TaskService } from 'src/app/services/taskService/task.service';
import { Subscription } from 'rxjs';
import { Unsubscribe } from '@angular/fire/auth';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css'],
})
export class BoardPageComponent implements OnInit, OnDestroy {
  title = 'Board';
  loading = false;
  board?: IList & IBoard;
  lists: (IList & IBoard)[] = [];
  sidebar: IList | IBoard | ITask | null = null;

  public CollectionNames = Collection;
  public OperationTypes = OperationType;

  private boardSub!: Subscription;
  private listsSub!: Subscription;
  private tasksSub!: Subscription;

  private unsubBoard!: Unsubscribe;
  private unsubLists!: Unsubscribe;
  private unsubTasks!: Unsubscribe;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private boardService: BoardService,
    private listService: ListService,
    private taskService: TaskService,
  ) { }

  async openModal(collectionName: Collection, opType: OperationType.create | OperationType.update, list?: IList | IBoard): Promise<void> {
    const listDialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: opType === OperationType.update ? `Edit list ${list?.title}` : `Create new list`,
      },
    };

    const dialogRef = this.dialog.open(
      CreateUpdateDialogComponent,
      listDialogData
    );
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result || !this.board?.id) {
        return;
      } else {
        if (result.op === OperationType.create) {
          await this.listService.addList(result.item, this.board?.id);
        } else {
          this.listService.updateList(result.item);
        }
      }
    });
  }

  openConfirmModal(collectionName: Collection, opType: OperationType, list?: IList | IBoard): void {
    const dialogData: IDialogData = {
      data: {
        item: list ? list : {},
        modalTitle: `Remove list`,
        modalDescription: `Are you sure you want to remove ${list?.title}?`,
      },
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogData);
    dialogRef.afterClosed().subscribe(async (result: DialogResult) => {
      if (!result) {
        return;
      } else {
        if (result.item.id && list?.id && this.board?.id) {
          await this.listService.deleteList(result.item, this.board?.id);
        }
      }
    });
  }

  ngOnInit(): void {
    this.boardService?.unsubscribe?.();
    this.listService?.unsubscribe?.();
    this.taskService?.unsubscribe?.();
    const routeParams = this.activatedRoute.snapshot.paramMap;
    const boardIdFromRoute = routeParams.get('boardId') || '';
    this.loading = true;
    if (!boardIdFromRoute) {
      this.loading = false;
      this.router.navigate(['/']);
    } else {
      this.unsubBoard?.();
      this.boardSub?.unsubscribe?.();
      this.unsubBoard = this.boardService.subscribeOnBoardChange(boardIdFromRoute);
      this.boardService.loading.subscribe(loadingState => this.loading = loadingState);
      this.boardSub = this.boardService.result.subscribe(board => {
        this.board = board as (IList & IBoard);
        const tempLists: (IList)[] = [];
        const tasksIds: string[] = [];
        if (board?.lists?.length) {
          this.unsubLists?.();
          this.listsSub?.unsubscribe?.();
          this.unsubLists = this.listService.subscribeOnListsChange(this.board?.lists);

          this.listsSub = this.listService.result.subscribe(lists => {
            tasksIds.length = 0;
            tempLists.length = 0;
            (lists as (IList & IBoard)[]).forEach((list) => {
              tempLists.push({ ...list, tasksRefs: [] });
              tasksIds.push(...list?.tasks);
            });

            if (tasksIds.length) {
              this.unsubTasks?.();
              this.tasksSub?.unsubscribe?.();
              this.unsubTasks = this.taskService.subscribeOnTasksChange(tasksIds);
              this.tasksSub = this.taskService.results.subscribe(tasks => {
                (lists as (IList & IBoard)[]).forEach((list: IList, listInd: number) => {
                  tempLists[listInd].tasksRefs.length = 0;
                  list.tasks.forEach((task) => {
                    const currentTask = (tasks as ITask[]).find(
                      (tempTask) => tempTask.id === task
                    );
                    if (currentTask) {
                      tempLists[listInd].tasksRefs.push(currentTask);
                    }
                  });
                });
              });
            }

            this.lists = tempLists as (IList & IBoard)[];
          });
        }
      });
    }
  }

  getListsConnectedTo(id?: string): string[] {
    return this.lists.filter((list) => list.id !== id).map((l) => l.id);
  }

  handleSidebarState(content?: IList | IBoard | ITask | null): void {
    this.sidebar = content ? content : null;
  }

  ngOnDestroy(): void {
    this.unsubBoard?.();
    this.unsubLists?.();
    this.unsubTasks?.();
    this.boardSub?.unsubscribe?.();
    this.listsSub?.unsubscribe?.();
    this.tasksSub?.unsubscribe?.();
    this.boardService?.unsubscribe?.();
    this.listService?.unsubscribe?.();
    this.taskService?.unsubscribe?.();
  }
}
