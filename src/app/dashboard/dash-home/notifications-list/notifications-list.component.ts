import { Component, Input, OnInit } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic, NotificationFormatter } from '@shared/interfaces/notification.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;

  @Input('data') set data(value: NotificationBasic[]) {
    this.notifications = value.sort(ArraySorting.sortObjectByKey('date', 'desc'));
  }

  notifications: NotificationBasic[] = [];
  formatter = NotificationFormatter;
  isLoaderShown = false;

  constructor(
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    if (window.location.href.endsWith('#notifications')) {
      const el = document.getElementById('notification-dashboard');
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  onSelectNotification(notification: NotificationBasic): void {
    this.notificationService.onSelectNotification(notification);
  }

  changeStatus(notification: NotificationBasic) {
    const newStatus = notification.read === 1 ? 0 : 1;
    this.notificationService.changeStatus(notification, newStatus);
  }
}
