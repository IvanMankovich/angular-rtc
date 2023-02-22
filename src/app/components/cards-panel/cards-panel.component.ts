import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Collection, IBoard, IList, ITask, OperationType } from 'src/app/types/types';

@Component({
  selector: 'app-cards-panel',
  templateUrl: './cards-panel.component.html',
  styleUrls: ['./cards-panel.component.css']
})
export class CardsPanelComponent {
  @Input() collectionName!: Collection;
  @Input() lists: (IBoard & IList)[] = [];
  @Input() title: string | undefined;
  @Input() loading: boolean = true;
  @Input() openModal!: (collectionName: Collection, opType: OperationType, list?: IList | IBoard) => Promise<void>;
  @Input() openConfirmModal!: (collectionName: Collection, opType: OperationType, list?: IList | IBoard) => void;
  @Input() getListsConnectedTo?: (id?: string) => string[];
  @Input() handleSidebarState!: (content?: IList | IBoard | ITask | null) => void;

  public CollectionNames = Collection;
  public OperationTypes = OperationType;
}
