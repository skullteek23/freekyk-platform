import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';
import { TeamService } from 'src/app/services/team.service';
import { Invite } from '@shared/interfaces/notification.model';

@Component({
  selector: 'app-da-te-join-requests',
  templateUrl: './da-te-join-requests.component.html',
  styleUrls: ['./da-te-join-requests.component.scss'],
})
export class DaTeJoinRequestsComponent implements OnInit {

  teamInvites$: Observable<Invite[]>;

  constructor(
    private teamService: TeamService,
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.getInvitesForTeam();
  }

  getInvitesForTeam(): void {
    const tid = sessionStorage.getItem('tid');
    this.teamInvites$ = this.teamService.getTeamInvites(tid);
  }

  onSendAgain(invite: Invite): void {
    this.notificationService.callUpdateTeamInvite('wait', invite.id);
  }

  onDelete(invId: string): void {
    this.notificationService.deleteInvite(invId);
  }

  onInviteMore(): void {
    this.notificationService.onOpenInvitePlayersDialog();
  }
}
