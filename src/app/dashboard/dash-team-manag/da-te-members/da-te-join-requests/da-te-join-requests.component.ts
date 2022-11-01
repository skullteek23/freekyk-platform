import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TeamService } from 'src/app/services/team.service';
import { Invite } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-da-te-join-requests',
  templateUrl: './da-te-join-requests.component.html',
  styleUrls: ['./da-te-join-requests.component.css'],
})
export class DaTeJoinRequestsComponent implements OnInit {
  teamInvites$: Observable<Invite[]>;
  constructor(
    private teamServ: TeamService,
    private notifServ: NotificationsService
  ) { }
  ngOnInit(): void {
    this.getInvitesForTeam();
  }
  getInvitesForTeam(): void {
    const tid = sessionStorage.getItem('tid');
    this.teamInvites$ = this.teamServ.getTeamInvites(tid);
  }
  onSendAgain(invite: Invite): void {
    this.notifServ.callUpdateTeamInvite('wait', invite.id);
  }
  onDelete(invId: string): void {
    this.notifServ.deleteInvite(invId);
  }
  onInviteMore(): void {
    this.notifServ.onOpenInvitePlayersDialog();
  }
}
