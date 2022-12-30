import { Component, Input, OnInit } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants } from '@shared/constants/constants';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

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

  constructor(
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void { }

  onSelectNotification(notification: NotificationBasic): void {
    this.notificationService.onSelectNotification(notification);
  }

  changeStatus(notification: NotificationBasic, status: boolean) {
    this.notificationService.markNotification(notification.id, status);
  }
}
