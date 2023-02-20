import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Collection, IBoard, IList, ITask } from 'src/app/types/types';

@Component({
  selector: 'app-cards-panel',
  templateUrl: './cards-panel.component.html',
  styleUrls: ['./cards-panel.component.css']
})
export class CardsPanelComponent {
  @Input() cardType: Collection | null = null;
  @Input() lists: (IBoard & IList)[] = [];
  @Input() title: string | undefined;
  @Input() loading: boolean = true;
  @Input() openModal!: (listId?: string, list?: IList | IBoard) => Promise<void>;
  @Input() openConfirmModal!: (listId?: string, list?: IList | IBoard) => void;
  @Input() getListsConnectedTo?: (id?: string) => string[];
  @Input() handleSidebarState!: (content?: IList | IBoard | ITask | null) => void;
}
