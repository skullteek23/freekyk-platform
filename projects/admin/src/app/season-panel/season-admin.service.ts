import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { dummyFixture, MatchFixture, MatchFixtureOverview, MatchLineup } from 'src/app/shared/interfaces/match.model';
import { fixtureGenerationData } from 'src/app/shared/interfaces/others.model';
import { statusType } from 'src/app/shared/interfaces/season.model';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { MatchConstantsSecondary, MatchConstants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SeasonAdminService {

  constructor(private ngFire: AngularFirestore, private snackbarService: SnackbarService) { }

  onGenerateDummyFixtures(data: fixtureGenerationData): dummyFixture[] {
    let fcpMatches = data.matches.fcp;
    let fkcMatches = this.calculateTotalKnockoutMatches(data.matches.fkc ? data.teamParticipating : 0);
    let fplMatches = this.calculateTotalLeagueMatches(data.matches.fpl ? data.teamParticipating : 0);
    const totalMatches: number = fcpMatches + fkcMatches + fplMatches;
    const grounds = data.grounds;
    const availableSlotList: { date: Date, groundName: string, locCity: string, locState: string }[] = [];
    let initialDate = new Date(data.startDate);
    while (availableSlotList.length < totalMatches) {
      const day = initialDate.getDay();
      for (let k = 0; k < grounds.length; k++) {
        const grTimings = grounds[k].timings;
        const groundName = grounds[k].name;
        const locCity = grounds[k].locCity;
        const locState = grounds[k].locState;
        if (grTimings.hasOwnProperty(day)) {
          const grTimingsByDay = grTimings[day] as number[];
          for (let i = 0; i < grTimingsByDay.length; i++) {
            if (!availableSlotList.length) {
              const date = new Date(JSON.parse(JSON.stringify(initialDate)));
              date.setHours(grTimingsByDay[i]);
              if (availableSlotList.length < totalMatches) {
                availableSlotList.push({ date, groundName, locCity, locState });
              }
              continue;
            }
            const currentHour = grTimingsByDay[i];
            const lastDateHour = availableSlotList[availableSlotList.length - 1].date.getHours();
            const currentDay = day;
            const lastDateDay = availableSlotList[availableSlotList.length - 1].date.getDay();
            const currentGround = groundName;
            const lastGround = availableSlotList[availableSlotList.length - 1].groundName;
            if (this.getDifference(currentHour, lastDateHour) >= data.oneMatchDur && currentDay === lastDateDay ||
              this.getDifference(currentHour, lastDateHour) <= data.oneMatchDur && currentDay !== lastDateDay ||
              this.getDifference(currentHour, lastDateHour) <= data.oneMatchDur && currentDay === lastDateDay && lastGround !== currentGround) {
              const date = new Date(JSON.parse(JSON.stringify(initialDate)));
              date.setHours(grTimingsByDay[i]);
              if (availableSlotList.length < totalMatches) {
                availableSlotList.push({ date, groundName, locCity, locState });
              }
            }
          }
        }
      };
      initialDate.setDate(initialDate.getDate() + 1);
    }
    availableSlotList.sort(ArraySorting.sortObjectByKey('date'));
    const fixturesTemp: dummyFixture[] = [];
    for (let index = 0; index < availableSlotList.length; index++) {
      let matchType: "FKC" | "FCP" | "FPL" = 'FCP';
      if (fcpMatches && index < fcpMatches) {
        matchType = 'FCP';
      }
      if (fkcMatches && index >= fcpMatches) {
        matchType = 'FKC';
      }
      if (fplMatches && index >= (fkcMatches + fcpMatches)) {
        matchType = 'FPL';
      }
      fixturesTemp.push({
        date: firebase.firestore.Timestamp.fromDate(availableSlotList[index].date),
        concluded: false,
        premium: true,
        season: data.sName,
        type: matchType,
        locCity: availableSlotList[index].locCity,
        locState: availableSlotList[index].locState,
        stadium: availableSlotList[index].groundName,
      });
    }
    fixturesTemp.sort(ArraySorting.sortObjectByKey('date'));
    const fixtures = fixturesTemp.map((element, index) => {
      const i = index + 1;
      return {
        ...element,
        id: this.getMID(element.type, i)
      }
    })
    return fixtures && fixtures.length ? fixtures : [];
  }

  getPublishableFixture(data: dummyFixture[]) {
    return data.map(val => {
      const newId = this.ngFire.createId();
      return {
        id: val.id,
        date: val.date,
        concluded: false,
        home: {
          name: MatchConstantsSecondary.TO_BE_DECIDED,
          logo: MatchConstantsSecondary.DEFAULT_LOGO
        },
        away: {
          name: MatchConstantsSecondary.TO_BE_DECIDED,
          logo: MatchConstantsSecondary.DEFAULT_LOGO
        },
        teams: [MatchConstantsSecondary.TO_BE_DECIDED],
        season: val.season,
        premium: val.premium,
        type: val.type,
        locCity: val.locCity,
        locState: val.locState,
        stadium: val.stadium,
      } as MatchFixture;
    })
  }

  updateGroundAvailability(groundIds: string[] = [], unavailableStartDate: Date, unavailableEndDate: Date) {
    let allAsyncPromises = [];
    unavailableStartDate.setDate(unavailableStartDate.getDate() + 1);
    unavailableStartDate.setHours(0);
    unavailableStartDate.setMinutes(0);
    const startDate = new Date(JSON.parse(JSON.stringify(unavailableStartDate)));
    unavailableEndDate.setDate(unavailableEndDate.getDate() + 1);
    unavailableEndDate.setHours(0);
    unavailableEndDate.setMinutes(0);
    const endDate = new Date(JSON.parse(JSON.stringify(unavailableEndDate)));
    groundIds.forEach(groundId => {
      allAsyncPromises.push(this.ngFire.collection('groundsPvt').doc(groundId).update({
        unavailableStartDate: startDate,
        unavailableEndDate: endDate
      }));
    })
    return Promise.all(allAsyncPromises);
  }

  onCreateFixtures(
    fixtures: MatchFixture[],
    overviews: MatchFixtureOverview[] = [],
    lineups: MatchLineup[] = []
  ) {
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

  deleteDraft(docID: string, deleteFixturesOnly = false): Promise<any> {
    return this.getSeasonFixtureDrafts(docID).pipe(switchMap(response => {
      const batch = this.ngFire.firestore.batch();

      if (response && response.length) {
        response.forEach(deleteDocID => {
          const draftRef = this.ngFire.collection('seasonFixturesDrafts').doc(deleteDocID).ref;
          batch.delete(draftRef);
        })
      }

      if (deleteFixturesOnly === false) {
        const draftRef = this.ngFire.collection('seasonDrafts').doc(docID).ref;
        batch.delete(draftRef);
      }

      return batch.commit();
    })).toPromise();
  }

  getSeasonFixtureDrafts(draftID): Observable<any> {
    if (draftID) {
      return this.ngFire.collection('seasonFixturesDrafts', query => query.where('draftID', '==', draftID))
        .get()
        .pipe(map(resp => resp.docs.map(doc => doc.exists ? doc.id : null)))
    }
  }

  calculateTotalTournamentMatches(teams: number): number {
    return this.calculateTotalLeagueMatches(teams) + this.calculateTotalKnockoutMatches(teams);
  }

  private getMID(type: 'FKC' | 'FPL' | 'FCP', index) {
    const uniqueID = this.ngFire.createId().slice(0, 8).toLocaleUpperCase();
    switch (type) {
      case 'FKC': return `${uniqueID}-${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FKC}-${index}`;
      case 'FPL': return `${uniqueID}-${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FPL}-${index}`;
      case 'FCP': return `${uniqueID}-${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FCP}-${index}`;
    }
  }

  private calculateTotalLeagueMatches(teams: number): number {
    return !teams ? 0 : (teams * (teams - 1)) / 2;
  }

  private calculateTotalKnockoutMatches(teams: number): number {
    return !teams ? 0 : teams - 1;
  }

  private getDifference(a: number, b: number): number {
    return a - b;
  }

  getStatusClass(status: statusType): any {
    if (this.isSeasonLive(status)) {
      return { 'green': true };
    } else if (status === 'READY TO PUBLISH') {
      return { 'yellow': true };
    } else if (status === 'DRAFTED') {
      return { 'grey': true };
    } else if (this.isSeasonFinished(status)) {
      return { 'greenLight': true };
    }
    return {};
  }

  isSeasonLive(status: statusType): boolean {
    return status === 'PUBLISHED';
  }

  isSeasonFinished(status: statusType): boolean {
    return status === 'FINISHED';
  }
}
