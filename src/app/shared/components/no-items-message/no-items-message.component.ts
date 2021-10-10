import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-items-message',
  templateUrl: './no-items-message.component.html',
  styleUrls: ['./no-items-message.component.css'],
})
export class NoItemsMessageComponent implements OnInit {
  @Input() items = 'items';
  constructor() {}
  ngOnInit(): void {}
}
