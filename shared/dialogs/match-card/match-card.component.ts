import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ITeamPlayer } from '@shared/components/team-player-members-list/team-player-members-list.component';
import { TeamMembers, Tmember } from '@shared/interfaces/team.model';
import { map } from 'rxjs/operators';
import { MatchFixture, MatchDayReport, MatchStatus } from '../../interfaces/match.model';
import { ListOption } from '../../interfaces/others.model';
import { PlayerCardComponent } from '../player-card/player-card.component';
import { ViewGroundCardComponent } from '../view-ground-card/view-ground-card.component';
import { ApiGetService } from '@shared/services/api.service';
import { ISeason } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-match-card',
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.scss'],
})
export class MatchCardComponent implements OnInit {

  homeLineup: ITeamPlayer[] = [];
  awayLineup: ITeamPlayer[] = [];
  statsData: MatchDayReport;
  data: MatchFixture;
  lineup: ITeamPlayer[] = [];

  constructor(
    public dialogRef: MatDialogRef<MatchCardComponent>,
    @Inject(MAT_DIALOG_DATA) public matchID: string,
    private ngFirestore: AngularFirestore,
    private dialog: MatDialog,
    private apiGetService: ApiGetService
  ) { }

  ngOnInit(): void {
    if (this.matchID) {
      this.getFixtureData();
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  getFixtureData() {
    this.ngFirestore
      .collection('allMatches').doc(this.matchID)
      .get()
      .pipe(map((resp) => (resp.data() as MatchFixture)))
      .subscribe(response => {
        this.data = response;
        if (this.data.type === 'Pickup') {
          this.getPickupGameLineup();
        } else {
          this.getMatchLineup();
        }
        if (this.data.status === MatchStatus.STU || this.data.status === MatchStatus.STD) {
          this.getMatchReport();
        }
      });
  }

  async getPickupGameLineup(): Promise<any> {
    const seasons: ISeason[] = await this.apiGetService.getSeasonByName(this.data.season).toPromise();
    const players = await this.apiGetService.getPlayers().toPromise();
    if (seasons?.length === 1 && players?.length) {
      const slots = await this.apiGetService.getSeasonBookedSlots(seasons[0].id).toPromise();
      if (slots?.length) {
        slots.forEach(slot => {
          const player = players.find(el => el.id === slot.uid);
          if (player) {
            this.lineup.push({
              name: player.name,
              imgpath: player.imgpath,
              position: player.position,
              id: player.id,
              customText: `${slot.slots.length} Slot(s) confirmed`
            });
          }
        })
      } else {
        this.lineup = [];
      }
    } else {
      this.lineup = [];
    }
  }

  async getMatchLineup(): Promise<any> {
    const homeData = (await this.ngFirestore.collection('teams', query => query.where('tname', '==', this.data.home.name)).get().toPromise());
    const awayData = (await this.ngFirestore.collection('teams', query => query.where('tname', '==', this.data.away.name)).get().toPromise());
    if (!homeData?.empty && homeData?.docs[0]?.exists) {
      const membersList: Tmember[] = ((await this.ngFirestore.collection(`teams/${homeData?.docs[0].id}/additionalInfo`).doc('members').get().toPromise()).data() as TeamMembers).members;
      this.homeLineup = membersList.map(el => ({ imgpath: el.imgpath_sm, name: el.name, position: el.pl_pos, id: el.id }));
    } else {
      this.homeLineup = [];
    }
    if (!awayData?.empty && awayData?.docs[0]?.exists) {
      const membersList: Tmember[] = ((await this.ngFirestore.collection(`teams/${awayData?.docs[0].id}/additionalInfo`).doc('members').get().toPromise()).data() as TeamMembers).members
      this.awayLineup = membersList.map(el => ({ imgpath: el.imgpath_sm, name: el.name, position: el.pl_pos, id: el.id }));
    } else {
      this.awayLineup = [];
    }
  }

  getMatchReport(): void {
    this.ngFirestore
      .collection('matchReports')
      .doc(this.data.id)
      .get()
      .pipe(map((resp) => resp.data() as MatchDayReport))
      .subscribe(response => {
        this.statsData = response;
      });
  }

  OnOpenGround() {
    const data: ListOption = {
      viewValue: this.data.ground,
      value: this.data.groundID
    }
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }

  onOpenPlayerProfile(pid: string): void {
    const dialogRef = this.dialog.open(PlayerCardComponent, {
      panelClass: 'fk-dialogs',
      data: pid,
    });
  }
}
