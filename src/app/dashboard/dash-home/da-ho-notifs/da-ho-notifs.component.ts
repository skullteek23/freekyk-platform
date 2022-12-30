import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-da-ho-notifs',
  templateUrl: './da-ho-notifs.component.html',
  styleUrls: ['./da-ho-notifs.component.scss'],
})
export class DaHoNotifsComponent implements OnInit, OnDestroy {

  isLoading = true;
  notifications: NotificationBasic[] = [];
  noNotification: boolean = false;
  subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationsService
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(this.notificationService.notifsChanged.subscribe(notifications => {
      if (notifications) {
        notifications.sort(ArraySorting.sortObjectByKey('date', 'desc'));
        this.notifications = notifications.filter(el => !el.read).slice(0, 5);
      }
    }));
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
