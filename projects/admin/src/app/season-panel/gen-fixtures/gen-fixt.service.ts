import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import {
  MatchFixture,
  MatchFixtureOverview,
  MatchLineup,
  tempFixtureData,
} from 'src/app/shared/interfaces/match.model';
import {
  CloufFunctionFixtureData,
  tempTour,
} from 'src/app/shared/interfaces/others.model';
import firebase from 'firebase/app';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { CLOUD_FUNCTIONS } from 'src/app/shared/Constants/CLOUD_FUNCTIONS';
// import { CALCULATE_MIN_DURATION } from './externalFunctions';

@Injectable({
  providedIn: 'root',
})
export class GenFixtService implements OnDestroy {
  private tempTourData: tempTour = {
    participantCount: null,
    perTeamPlaying: null,
    tour_type: null,
    startDate: null,
  };
  private selSeason: SeasonBasicInfo = {
    name: null,
    imgpath: null,
    locCity: null,
    locState: null,
    premium: null,
    start_date: null,
    cont_tour: null,
    id: null,
  };
  selGrounds: GroundPrivateInfo[];
  stepChange = new EventEmitter();
  matches: number = 0;
  hours: number = 0;
  perMatchHr: number = 2;
  hrsChanged = new BehaviorSubject<number>(0);
  addTimings(info: GroundPrivateInfo[]) {
    this.selGrounds = info;
  }
  addTourData(data: tempTour) {
    this.tempTourData = data;

    // temp adjustment when there are no participants
    // this.tempTourData.participantCount = 4;
    // temp adjustment when there are no participants

    switch (data.tour_type) {
      case 'FKC':
        this.matches = this.calcKCMatches(data.participantCount);
        this.hours = this.calcKCTotalHrs(
          data.perTeamPlaying,
          data.participantCount
        );
        this.hrsChanged.next(this.hours);
        break;
      case 'FCP':
        this.matches = this.calcCPMatches();
        this.hours = this.calcCPTotalHrs(data.participantCount);
        this.hrsChanged.next(this.hours);
        break;
      case 'FPL':
        this.matches = this.calcPLMatches(data.participantCount);
        this.hours = this.calcPLTotalHrs(
          data.perTeamPlaying,
          data.participantCount
        );
        this.hrsChanged.next(this.hours);
        break;

      default:
        break;
    }
  }
  onSelectSeason(data: SeasonBasicInfo) {
    this.selSeason = data;
  }
  onNextStep() {
    this.stepChange.emit(true);
  }
  onPreviousStep() {
    this.stepChange.emit(false);
  }
  getTotalHours() {
    return this.hours;
  }
  getTotalMatches(FKC: boolean) {
    return !FKC ? this.matches : this.matches - 1;
  }
  getTourData() {
    return this.tempTourData;
  }
  getSeason() {
    return this.selSeason;
  }
  onCalcMinDur(grTimings: {}[]) {
    // return CALCULATE_MIN_DURATION(grTimings, this.hours, this.perMatchHr);
    return 1;
  }
  initLeagueTable() {
    const initLeagueTableFunc = this.ngFunc.httpsCallable(
      CLOUD_FUNCTIONS.INIT_LEAGUE_TABLE
    );
    if (this.selSeason && this.selSeason.id) {
      return initLeagueTableFunc(this.selSeason.id);
    }
  }
  onGenFixtures() {
    const fixtureFunc = this.ngFunc.httpsCallable(
      CLOUD_FUNCTIONS.GENERATE_FITURES
    );
    const data: CloufFunctionFixtureData = {
      sid: this.selSeason.id,
      sname: this.selSeason.name,
      grounds: this.selGrounds,
      matches: this.matches,
      oneMatchDur: this.perMatchHr,
      startDate: this.tempTourData.startDate,
      tour_type: this.tempTourData.tour_type,
    };
    return from(fixtureFunc(data)).pipe(
      map((docs) =>
        docs.map(
          (doc) =>
            <{}>{
              date: new firebase.firestore.Timestamp(
                doc.date._seconds,
                doc.date._nanoseconds
              ),
              concluded: false,
              teams: doc.teams,
              logos: doc.logos,
              season: doc.season,
              premium: true,
              type: doc.type,
              locCity: doc.locCity,
              locState: doc.locState,
              stadium: doc.stadium,
            }
        )
      ),
      map((resp) => <MatchFixture[]>resp)
    );
  }
  onCreateFixtures(
    fixtures: MatchFixture[],
    overviews: MatchFixtureOverview[],
    lineups: MatchLineup[]
  ) {
    console.log(fixtures);
    var batch = this.ngFire.firestore.batch();
    for (let i = 0; i < fixtures.length; i++) {
      const colRef = this.ngFire
        .collection('allMatches')
        .doc(fixtures[i].id).ref;
      batch.set(colRef, fixtures[i]);
    }
    for (let i = 0; i < overviews.length; i++) {
      const colRef = this.ngFire
        .collection('allMatches/' + fixtures[i].id + '/additionalInfo')
        .doc('matchOverview').ref;
      batch.set(colRef, overviews[i]);
    }
    for (let i = 0; i < lineups.length; i++) {
      const colRef = this.ngFire
        .collection('allMatches/' + fixtures[i].id + '/additionalInfo')
        .doc('matchLineup').ref;
      batch.set(colRef, lineups[i]);
    }
    return batch.commit();
  }
  private calcPLMatches(teams: number): number {
    return (+teams * (+teams - 1)) / 2;
  }
  private calcKCMatches(teams: number): number {
    return +teams / 2;
  }
  private calcCPMatches(): number {
    return 1;
  }
  private calcPLTotalHrs(perMatchPlayers: number, teams: number): number {
    this.perMatchHr = +perMatchPlayers > 8 ? 3 : 2;
    return this.perMatchHr * ((+teams * (+teams - 1)) / 2);
  }
  private calcKCTotalHrs(perMatchPlayers: number, teams: number): number {
    this.perMatchHr = +perMatchPlayers > 8 ? 3 : 2;
    return this.perMatchHr * (+teams - 1);
  }
  private calcCPTotalHrs(perMatchPlayers: number): number {
    this.perMatchHr = +perMatchPlayers > 8 ? 3 : 2;
    return this.perMatchHr;
  }
  // private genFixtures(startdate: Date) {}
  ngOnDestroy() {
    console.log('gen fixtures service ended');
  }
  constructor(
    private ngFunc: AngularFireFunctions,
    private ngFire: AngularFirestore
  ) {
    console.log('gen fixtures service started');
  }
}
