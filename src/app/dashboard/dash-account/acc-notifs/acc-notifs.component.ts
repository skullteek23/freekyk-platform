import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-acc-notifs',
  templateUrl: './acc-notifs.component.html',
  styleUrls: ['./acc-notifs.component.scss'],
})
export class AccNotifsComponent implements OnInit {

  isLoading = true;
  notifications$: Observable<NotificationBasic[]>;
  noNotification$: Observable<boolean>;

  constructor(
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.notifications$ = this.notificationService.notifsChanged;
    this.noNotification$ = this.notifications$.pipe(
      map((resp) => resp?.length === 0)
    );
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getNotifications(): void {
    this.notificationService.getNotifications();
  }
}
