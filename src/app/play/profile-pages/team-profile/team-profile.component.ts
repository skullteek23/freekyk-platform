import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { Formatters } from '@shared/interfaces/team.model';
import { SocialShareService } from '@app/services/social-share.service';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { ApiService } from '@shared/services/api.service';
import { TeamAllInfo } from '@shared/utils/pipe-functions';
import { IStatisticsCard } from '@app/dashboard/dash-home/my-stats-card/my-stats-card.component';
import { NotificationsService } from '@app/services/notifications.service';
import { NotificationBasic, NotificationTypes } from '@shared/interfaces/notification.model';
import { TeamService } from '@app/services/team.service';

@Component({
  selector: 'app-team-profile',
  templateUrl: './team-profile.component.html',
  styleUrls: ['./team-profile.component.scss'],
})
export class TeamProfileComponent implements OnInit, OnDestroy {

  teamID: string = null;
  isLoaderShown = true;
  team: Partial<TeamAllInfo> = null;
  teamStats: IStatisticsCard[] = [];
  teamMedia: any[] = [];
  isTeamMember = false;
  formatter = Formatters;
  hasTeam = false;
  userID: string = null;
  userTeamID: string = null;
  isUserCaptain = false;
  subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private enlargeService: EnlargeService,
    private socialShareService: SocialShareService,
    private apiService: ApiService,
    private notificationService: NotificationsService,
    private teamService: TeamService
  ) { }

  ngOnInit(): void {
    this.userID = localStorage.getItem('uid') || null;
    this.userTeamID = sessionStorage.getItem('tid') || null;
    this.formatter = Formatters;
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('teamid')) {
          this.teamID = params['teamid'];
          this.getTeamInfo();
        }
      }
    }));
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getTeamInfo(): void {
    this.apiService.getTeamAllInfo(this.teamID)
      .subscribe({
        next: (response) => {
          if (response) {
            this.team = response;
            this.getPlayerInfo();
            this.createTeamStats();
            this.createTeamMedia();
          } else {
            this.router.navigate(['error']);
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        },
        error: () => {
          this.isLoaderShown = false;
          this.team = null;
          window.scrollTo(0, 0);
          this.router.navigate(['/error']);
        }
      });
  }

  getPlayerInfo() {
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.apiService.getPlayer(uid)
        .subscribe({
          next: (response) => {
            if (response) {
              this.isTeamMember = response.team?.id === this.team.id;
              this.hasTeam = response?.team !== null;
              this.isUserCaptain = response?.team ? response?.team?.capId === uid : false;
            } else {
              this.isTeamMember = false;
            }
          }
        })
    } else {
      this.isTeamMember = false;
    }
  }

  createTeamStats() {
    this.teamStats = [];
    this.teamStats.push({ icon: 'sports_soccer', label: 'Goals', value: this.team?.g || 0 });
    this.teamStats.push({ icon: 'flag', label: 'Wins', value: this.team?.w || 0 });
    this.teamStats.push({ icon: 'cancel_presentation', label: 'Losses', value: this.team?.l || 0 });
    this.teamStats.push({ icon: 'sports_soccer', label: 'Matches', value: (this.team?.fkc_played + this.team?.fcp_played + this.team?.fpl_played) || 0, });
    this.teamStats.push({ icon: 'style', label: 'Cards', value: this.team?.rcards || 0, iconClass: 'red' });
    this.teamStats.push({ icon: 'style', label: 'Cards', value: this.team?.ycards || 0, iconClass: 'yellow' });
    this.teamStats.push({ icon: 'sports_handball', label: 'Conceded', value: this.team?.g_conceded || 0, });
  }

  createTeamMedia() {
    this.teamMedia = [];
    if (this.team?.media?.length) {
      this.team.media.forEach(element => {
        this.teamMedia.push({ image: element, thumbImage: element });
      });
    }
  }

  enlargePhoto(): void {
    if (this.team?.imgpath) {
      this.enlargeService.onOpenPhoto(this.team.imgpath);
    }
  }

  share() {
    if (this.team.id) {
      const data = new ShareData();
      data.share_url = `/t/${this.team.id}`;
      this.socialShareService.onShare(data);
    }
  }

  joinTeam() {
    if (this.userTeamID) {
      this.teamService.onOpenJoinTeamDialog();
    } else {
      this.router.navigate(['/dashboard/team-management']);
    }
  }

  challengeTeam() {
    if (this.userTeamID && !this.isSelectedTeamMember && !this.isSelectedTeamCaptain) {
      this.isLoaderShown = true;
      const notification: NotificationBasic = {
        type: NotificationTypes.challengeTeam,
        senderID: this.userID,
        receiverID: this.team.captainId,
        date: new Date().getTime(),
        receiverName: this.team.captainName,
        read: 0,
        expire: 0,
        senderName: this.userTeamID,
      };
      this.notificationService.sendNotification(notification)
        .finally(() => this.isLoaderShown = false);
    }
  }

  manageTeam(isCommunication = false) {
    if (isCommunication) {
      this.router.navigate(['/dashboard/team-management'], { fragment: 'communication' });
    } else {
      this.router.navigate(['/dashboard/team-management']);
    }
  }

  get isSelectedTeamCaptain(): boolean {
    return this.userID && this.userID === this.team.captainId;
  }

  get isSelectedTeamMember(): boolean {
    return this.userTeamID && this.userTeamID === this.team.id;
  }
}
