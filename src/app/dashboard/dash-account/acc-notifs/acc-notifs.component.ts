import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-acc-notifs',
  templateUrl: './acc-notifs.component.html',
  styleUrls: ['./acc-notifs.component.scss'],
})
export class AccNotifsComponent implements OnInit, OnDestroy {

  isLoading = true;
  isLoaderShown = false
  notifications$: Observable<NotificationBasic[]>;
  noNotification$: Observable<boolean>;
  subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.notificationService.requestAcceptLoadingStatus.subscribe((response: boolean) => {
      this.isLoaderShown = response;
    }));
    this.notifications$ = this.notificationService.notifsChanged;
    this.noNotification$ = this.notifications$.pipe(
      map((resp) => resp?.length === 0)
    );
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getNotifications(): void {
    this.notificationService.getNotifications();
  }
}
