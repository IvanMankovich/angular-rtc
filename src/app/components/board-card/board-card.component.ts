import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IBoard } from 'src/app/types/types';

@Component({
  selector: 'app-board-card',
  templateUrl: './board-card.component.html',
  styleUrls: ['./board-card.component.css'],
})
export class BoardCardComponent {
  @Input() board: IBoard | null = null;
  @Output() edit = new EventEmitter<IBoard>();
  @Output() delete = new EventEmitter<IBoard>();
  @Output() save = new EventEmitter<IBoard>();
}
