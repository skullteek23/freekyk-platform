import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TeamService } from 'src/app/services/team.service';
import { Invite } from 'src/app/shared/interfaces/notification.model';

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
  ) {
    this.getInvitesForTeam();
  }
  ngOnInit(): void {}
  getInvitesForTeam() {
    const tid = sessionStorage.getItem('tid');
    this.teamInvites$ = this.teamServ.getTeamInvites(tid);
  }
  onSendAgain(invite: Invite) {
    this.notifServ.callUpdateTeamInvite('wait', invite.id);
  }
  onDelete(invId: string) {
    this.notifServ.deleteInvite(invId);
  }
  onInviteMore() {
    this.notifServ.onOpenInvitePlayersDialog();
  }
}
