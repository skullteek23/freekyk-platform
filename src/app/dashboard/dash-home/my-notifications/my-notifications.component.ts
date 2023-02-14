import { Component, OnInit } from '@angular/core';
import { NotificationsService } from '@app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss']
})
export class MyNotificationsComponent implements OnInit {

  isLoading = true;
  notifications: NotificationBasic[] = [];
  noNotification: boolean = false;
  subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.getNotifications();
  }

  getNotifications() {
    this.subscriptions.add(this.notificationService.notifsChanged.subscribe(notifications => {
      if (notifications) {
        notifications.sort(ArraySorting.sortObjectByKey('date', 'desc'));
        this.notifications = notifications.filter(el => !el.read);
      }
    }));
  }

}
