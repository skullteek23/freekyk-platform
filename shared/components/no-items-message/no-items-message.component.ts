import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-no-items-message',
  templateUrl: './no-items-message.component.html',
  styleUrls: ['./no-items-message.component.scss'],
})
export class NoItemsMessageComponent {
  @Input() items = 'items';
  @Input() customText = null;
}
