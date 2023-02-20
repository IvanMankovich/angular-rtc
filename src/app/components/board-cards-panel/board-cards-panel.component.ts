import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IBoard, IList, ITask } from 'src/app/types/types';

@Component({
  selector: 'app-board-cards-panel',
  templateUrl: './board-cards-panel.component.html',
  styleUrls: ['./board-cards-panel.component.css']
})
export class BoardCardsPanelComponent {
  @Input() lists: IList[] = [];
  @Input() title: string | undefined;
  @Input() loading: boolean = true;
  @Input() openListModal!: (listId?: string, list?: IList) => Promise<void>;
  @Input() openBoardConfirmModal!: (listId?: string, list?: IList) => void;
  @Input() getListsConnectedTo!: (id?: string) => string[];
  @Input() handleSidebarState!: (content?: IList | IBoard | ITask | null) => void;
}
