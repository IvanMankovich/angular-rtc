import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { IBoard, IList, ITask } from 'src/app/types/types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() sidebar: IList | IBoard | ITask | null = null;
  @Output() handleSidebarState = new EventEmitter<IList>();

  created!: Date;
  updated!: Date;

  ngOnInit() {
    this.created = (this.sidebar?.created as Timestamp)?.toDate?.();
    this.updated = (this.sidebar?.updated as Timestamp)?.toDate?.();
  }
}
