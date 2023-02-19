import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsService } from '@app/services/notifications.service';
import { TeamService } from '@app/services/team.service';
import { MatchConstants } from '@shared/constants/constants';
import { PlayerCardComponent } from '@shared/dialogs/player-card/player-card.component';
import { NotificationBasic, NotificationTypes } from '@shared/interfaces/notification.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-invited-players-list',
  templateUrl: './invited-players-list.component.html',
  styleUrls: ['./invited-players-list.component.scss']
})
export class InvitedPlayersListComponent implements OnInit {

  readonly CUSTOM_FORMAT = MatchConstants.NOTIFICATION_DATE_FORMAT;
  invitesList: NotificationBasic[] = [];

  constructor(
    private teamService: TeamService,
    private notificationService: NotificationsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getInvitesForTeam();
  }

  getInvitesForTeam(): void {
    const tid = sessionStorage.getItem('tid');
    this.teamService.getTeamInvites(tid)
      .subscribe(response => {
        if (response) {
          const tempList = response.filter(res => res.expire === 0 && res.type === NotificationTypes.captainJoinInvite);
          this.invitesList = _.uniqBy(tempList, 'receiverID');
        }
      });
  }

  onInviteMore(): void {
    this.teamService.onOpenInvitePlayersDialog();
  }

  onOpenPlayerProfile(pid: string): void {
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: pid,
    });
  }
}
