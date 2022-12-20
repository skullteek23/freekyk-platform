import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
})
export class NotificationsListComponent implements OnInit {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;

  @Input('data') set data(value: NotificationBasic[]) {
    this.notifications = value.sort(ArraySorting.sortObjectByKey('date', 'desc'));
  }
  notifications: NotificationBasic[];
  noNotif$: Observable<boolean>;
  constructor(private notifServ: NotificationsService) { }
  ngOnInit(): void { }
  onSelNotif(selectedNotif: NotificationBasic): void {
    this.notifServ.onSelNotif(selectedNotif);
  }

  changeStatus(notif: NotificationBasic, status: boolean) {
    this.notifServ.markNotification(notif.id, status);
  }
}
