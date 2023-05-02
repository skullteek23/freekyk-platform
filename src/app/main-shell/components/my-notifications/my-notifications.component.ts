import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { NotificationsService } from '@app/services/notifications.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { NotificationBasic, NotificationFormatter } from '@shared/interfaces/notification.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss']
})
export class MyNotificationsComponent implements OnInit {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;

  isLoaderShown = false;
  list: NotificationBasic[] = [];
  listCache: NotificationBasic[] = [];
  formatter = NotificationFormatter;

  constructor(
    private apiService: ApiGetService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user) {
          this.getNotifications(user.uid);
        } else {
          this.list = [];
          this.listCache = [];
        }
      }
    })
  }

  getNotifications(uid: string) {
    this.isLoaderShown = true;
    this.apiService.getUserNotifications(uid).subscribe({
      next: (response) => {
        if (response) {
          this.list = response;
          this.listCache = JSON.parse(JSON.stringify(response));
        }
        this.isLoaderShown = false;
      },
      error: () => {
        this.list = [];
        this.listCache = [];
        this.isLoaderShown = false;
        this.snackbarService.displayError('Error: Notifications failed!');
      }
    })
  }

  openNotification(doc: NotificationBasic) {
    this.notificationService.onSelectNotification(doc);
  }

  changeStatus(notification: NotificationBasic) {
    const newStatus = notification.read === 1 ? 0 : 1;
    this.notificationService.changeStatus(notification, newStatus);
  }

  toggleNotifications(status: number) {
    if (status === 1) {
      this.list = this.listCache.filter(el => !el.read);
    } else {
      this.list = JSON.parse(JSON.stringify(this.listCache));
    }
  }

}
