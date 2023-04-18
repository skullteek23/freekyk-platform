import { Component, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

export class IActionShortcutData {
  icon: string = 'home';
  label: string = 'Home';
  highlight: boolean;
  route: string = null;
  extLink?: string = null;
  disabled?: boolean = false;
  svg?: string = null;
}

@Component({
  selector: 'app-action-shortcut-button',
  templateUrl: './action-shortcut-button.component.html',
  styleUrls: ['./action-shortcut-button.component.scss']
})
export class ActionShortcutButtonComponent implements OnInit {

  @Input() data = new IActionShortcutData();
  @Output() actionClick = new Subject<IActionShortcutData>();

  constructor() { }

  ngOnInit(): void {
  }

  clickAction() {
    this.actionClick.next(this.data);
  }

}
