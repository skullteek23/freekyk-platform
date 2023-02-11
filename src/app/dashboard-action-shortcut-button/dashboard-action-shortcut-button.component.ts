import { Component, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';

export class IActionShortcutData {
  actionLabel: string = 'Action Name';
  icon?: string = null;
  imgUrl?: string = null;
  secondaryLabel?: string = 'label 2';
}

@Component({
  selector: 'app-dashboard-action-shortcut-button',
  templateUrl: './dashboard-action-shortcut-button.component.html',
  styleUrls: ['./dashboard-action-shortcut-button.component.scss']
})
export class DashboardActionShortcutButtonComponent implements OnInit {

  @Input() data = new IActionShortcutData();
  @Output() actionTrigger = new Subject<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onOpenAction() {
    this.actionTrigger.next();
  }

}
