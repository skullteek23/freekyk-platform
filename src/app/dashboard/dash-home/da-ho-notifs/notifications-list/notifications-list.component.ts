import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from 'src/app/shared/interfaces/notification.model';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css'],
})
export class NotificationsListComponent implements OnInit {
  @Input('data') notifications: NotificationBasic[];
  noNotif$: Observable<boolean>;
  constructor(private notifServ: NotificationsService) {}
  ngOnInit(): void {}
  onSelNotif(selectedNotif: NotificationBasic) {
    this.notifServ.onSelNotif(selectedNotif);
  }
}
