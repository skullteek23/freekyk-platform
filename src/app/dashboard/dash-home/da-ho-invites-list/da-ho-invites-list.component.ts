import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Invite } from 'src/app/shared/interfaces/notification.model';

@Component({
  selector: 'app-da-ho-invites-list',
  templateUrl: './da-ho-invites-list.component.html',
  styleUrls: ['./da-ho-invites-list.component.css'],
})
export class DaHoInvitesListComponent implements OnInit {
  emptyInvites$: Observable<boolean>;
  invites$: Observable<Invite[]>;
  constructor(private notifServ: NotificationsService) {
    this.getInvites();
  }
  ngOnInit(): void {}
  getInvites(): void {
    this.emptyInvites$ = this.notifServ.emptyInvites;
    const uid = localStorage.getItem('uid');
    if (!!uid) {
      this.invites$ = this.notifServ
        .fetchInvites(uid)
        .pipe(tap(() => console.log('sub made')));
    }
  }
  onViewInvite(inv: Invite): void {
    this.notifServ.openTeamOffer(inv.id, inv.teamName);
  }
}
