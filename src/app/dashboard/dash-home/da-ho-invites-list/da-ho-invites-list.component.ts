import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Invite } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-da-ho-invites-list',
  templateUrl: './da-ho-invites-list.component.html',
  styleUrls: ['./da-ho-invites-list.component.scss'],
})
export class DaHoInvitesListComponent implements OnInit {

  emptyInvites$: Observable<boolean>;
  invites$: Observable<Invite[]>;

  constructor(
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.getInvites();
  }

  getInvites(): void {
    this.emptyInvites$ = this.notificationService.emptyInvites;
    const uid = localStorage.getItem('uid');
    if (!!uid) {
      this.invites$ = this.notificationService.fetchInvites(uid);
    }
  }

  onViewInvite(inv: Invite): void {
    this.notificationService.openTeamOffer(inv.id, inv.teamName);
  }
}
