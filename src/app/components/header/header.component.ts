
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor() { }
  @Output() changeEmitter = new EventEmitter<void>();

  ngOnInit(): void { }
  onChange(): void {
    this.changeEmitter.emit();
  }
}
