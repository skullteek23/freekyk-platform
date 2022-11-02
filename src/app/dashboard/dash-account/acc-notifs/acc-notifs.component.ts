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
  noNotif$: Observable<boolean>;
  constructor(private notifServ: NotificationsService) { }
  ngOnInit(): void {
    this.notifications$ = this.notifServ.notifsChanged;
    this.noNotif$ = this.notifServ.notifsCountChanged.pipe(
      map((resp) => resp === 0)
    );
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
  getNotifications(): void {
    this.notifServ.getNotifications();
  }
}
