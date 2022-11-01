import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CLOUD_FUNCTIONS } from 'src/app/shared/Constants/CLOUD_FUNCTIONS';
import { GroundBooking, GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { dummyFixture, MatchFixture, MatchReportFormData, ReportUpdates } from 'src/app/shared/interfaces/match.model';
import { fixtureGenerationData, ListOption } from 'src/app/shared/interfaces/others.model';
import { SeasonAbout, SeasonBasicInfo, SeasonDraft, statusType } from 'src/app/shared/interfaces/season.model';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { MatchConstantsSecondary, MatchConstants } from '../shared/constants/constants';

@Injectable({
  providedIn: 'root'
})
export class SeasonAdminService {
  constructor(private ngFire: AngularFirestore, private ngFunctions: AngularFireFunctions) { }

  onGenerateDummyFixtures(data: fixtureGenerationData): dummyFixture[] {
    const fcpMatches = data.matches.fcp;
    const fkcMatches = this.calculateTotalKnockoutMatches(data.matches.fkc ? data.teamParticipating : 0);
    const fplMatches = this.calculateTotalLeagueMatches(data.matches.fpl ? data.teamParticipating : 0);
    const totalMatches: number = fcpMatches + fkcMatches + fplMatches;
    const grounds = data.grounds;
    const availableSlotList: { date: Date; groundName: string; locCity: string; locState: string }[] = [];
    const initialDate = new Date(data.startDate);
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
      let matchType: 'FKC' | 'FCP' | 'FPL' = 'FCP';
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
        home: 'TBD',
        away: 'TBD',
        date: availableSlotList[index].date.getTime(),
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
      };
    });
    return fixtures && fixtures.length ? fixtures : [];
  }

  getPublishableFixture(data: dummyFixture[]) {
    return data.map(val => ({
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
    } as MatchFixture));
  }

  isStartDateOverlap(startDate: number, booking: GroundBooking): boolean {
    return (startDate >= booking.bookingFrom && startDate <= booking.bookingTo);
  }

  updateMatchReport(formData: MatchReportFormData, fixture: MatchFixture, playersListHome: ListOption[], playersListAway: ListOption[]): Promise<any> {
    const functionData = { formData, fixture, playersListHome, playersListAway };
    const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.UPDATE_MATCH_REPORT);
    return callable(functionData).toPromise();
  }

  deleteDraft(docID: string, deleteFixturesOnly = false): Promise<any> {
    return this.getSeasonFixtureDrafts(docID).pipe(switchMap(response => {
      const batch = this.ngFire.firestore.batch();

      if (response && response.length) {
        response.forEach(deleteDocID => {
          const draftRef = this.ngFire.collection('seasonFixturesDrafts').doc(deleteDocID).ref;
          batch.delete(draftRef);
        });
      }

      if (deleteFixturesOnly === false) {
        const draftRef = this.ngFire.collection('seasonDrafts').doc(docID).ref;
        batch.delete(draftRef);
      }

      return batch.commit();
    })).toPromise();
  }

  async publishSeason(data: any): Promise<any> {
    if (!data || !data.hasOwnProperty('seasonDraft') || !data.hasOwnProperty('fixturesDraft') || !data.hasOwnProperty('lastRegTimestamp')) {
      return;
    }
    const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.PUBLISH_SEASON);
    return callable(data).toPromise();
  }

  getSeasonFixtureDrafts(draftID): Observable<any> {
    if (draftID) {
      return this.ngFire.collection('seasonFixturesDrafts', query => query.where('draftID', '==', draftID))
        .get()
        .pipe(map(resp => resp.docs.map(doc => doc.exists ? doc.id : null)));
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
      return { green: true };
    } else if (status === 'READY TO PUBLISH') {
      return { yellow: true };
    } else if (status === 'DRAFTED') {
      return { grey: true };
    } else if (this.isSeasonFinished(status)) {
      return { greenLight: true };
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
