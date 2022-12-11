import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationsService } from 'src/app/services/notifications.service';
import { NotificationBasic } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-da-ho-notifs',
  templateUrl: './da-ho-notifs.component.html',
  styleUrls: ['./da-ho-notifs.component.scss'],
})
export class DaHoNotifsComponent implements OnInit {
  isLoading = true;
  notifications$: Observable<NotificationBasic[]>;
  noNotif$: Observable<boolean>;
  constructor(private notifServ: NotificationsService) {
    this.notifications$ = this.notifServ.notifsChanged;
    this.noNotif$ = this.notifications$.pipe(
      map((resp) => resp?.length === 0)
    );
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
  getNotifications(): void {
    this.notifServ.getNotifications();
  }
}
