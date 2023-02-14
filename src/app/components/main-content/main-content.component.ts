import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css'],
})
export class MainContentComponent implements OnInit {
  @Output() changeEmitter = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}

  onChange(): void {
    this.changeEmitter.emit();
  }
}
