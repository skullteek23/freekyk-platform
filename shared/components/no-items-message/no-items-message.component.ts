import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-items-message',
  templateUrl: './no-items-message.component.html',
  styleUrls: ['./no-items-message.component.css'],
})
export class NoItemsMessageComponent {
  @Input() items = 'items';
}
