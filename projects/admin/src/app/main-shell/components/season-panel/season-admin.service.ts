import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { GroundBooking, GROUND_TYPES } from '@shared/interfaces/ground.model';
import { IDummyFixture, MatchFixture, TournamentTypes, } from '@shared/interfaces/match.model';
import { LastParticipationDate, statusType } from '@shared/interfaces/season.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants, MatchConstantsSecondary } from '@shared/constants/constants';
import { AdminConfigurationSeason } from '@shared/interfaces/admin.model';
import { IGroundSelection } from './create-season/components/select-ground/select-ground.component';
import { ISelectMatchType } from './create-season/create-season.component';

export interface IDummyFixtureOptions {
  grounds?: IGroundSelection[];
  season?: string;
  fcpMatches?: number;
  fkcMatches?: number;
  fplMatches?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonAdminService {

  private adminConfigs: AdminConfigurationSeason;
  private selectedGrounds: IGroundSelection[] = [];

  constructor(
    private ngFire: AngularFirestore, private ngFunctions: AngularFireFunctions
  ) {
    this.getAdminConfigs();
  }

  getDummyFixtures(options: IDummyFixtureOptions): IDummyFixture[] {
    if (!options || Object.keys(options).length === 0) {
      return [];
    }
    const fixtures: IDummyFixture[] = [];
    const groundSlots: {
      name: string;
      locState: string;
      locCity: string;
      ownType: GROUND_TYPES;
      slot: number;
    }[] = [];
    options.grounds.map(ground => {
      const groundInfo: any = {
        name: ground.name,
        locState: ground.locState,
        locCity: ground.locCity,
        ownType: ground.ownType
      }
      ground.slots.forEach(slot => {
        groundSlots.push({ ...groundInfo, slot });
      })
    });
    groundSlots.sort(ArraySorting.sortObjectByKey('slot'));
    for (let i = 0; i < groundSlots.length; i++) {
      let matchType: TournamentTypes = 'FCP';
      if (options.fcpMatches && i < options.fcpMatches) {
        matchType = 'FCP';
      }
      if (options.fkcMatches && i >= options.fcpMatches) {
        matchType = 'FKC';
      }
      if (options.fplMatches && i >= (options.fkcMatches + options.fcpMatches)) {
        matchType = 'FPL';
      }
      const fixture: IDummyFixture = {
        home: 'TBD',
        away: 'TBD',
        id: this.getMID(matchType, i),
        date: groundSlots[i].slot,
        concluded: false,
        premium: groundSlots[i].ownType === 'PRIVATE',
        season: options.season,
        type: matchType,
        locCity: groundSlots[i].locCity,
        locState: groundSlots[i].locState,
        stadium: groundSlots[i].name
      }
      fixtures.push(fixture);
    }
    return fixtures;
  }

  // onGenerateDummyFixtures(data: fixtureGenerationData): dummyFixture[] {
  //   const fcpMatches = data.matches.fcp;
  //   const fkcMatches = this.calculateTotalKnockoutMatches(data.matches.fkc ? data.teamParticipating : 0);
  //   const fplMatches = this.calculateTotalLeagueMatches(data.matches.fpl ? data.teamParticipating : 0);
  //   const oneMatchDuration = this.adminConfigs?.duration || MatchConstants.ONE_MATCH_DURATION;


  //   const totalMatches: number = fcpMatches + fkcMatches + fplMatches;
  //   const grounds = data.grounds;
  //   const initialDate = new Date(data.startDate);

  //   const availableSlotList: { date: Date; groundName: string; }[] = [];

  //   while (availableSlotList.length < totalMatches) {
  //     const day = initialDate.getDay();
  //     for (const ground of grounds) {
  //       const grTimings = ground.timings;
  //       const groundName = ground.id;
  //       if (grTimings.hasOwnProperty(day)) {
  //         const grTimingsByDay = grTimings[day] as number[];
  //         for (const timing of grTimingsByDay) {
  //           if (!availableSlotList.length) {
  //             const date = new Date(JSON.parse(JSON.stringify(initialDate)));
  //             date.setHours(timing);
  //             if (availableSlotList.length < totalMatches) {
  //               availableSlotList.push({ date, groundName });
  //             }
  //             continue;
  //           }
  //           const currentHour = timing;
  //           const lastDateHour = availableSlotList[availableSlotList.length - 1].date.getHours();
  //           const currentDay = day;
  //           const lastDateDay = availableSlotList[availableSlotList.length - 1].date.getDay();
  //           const currentGround = groundName;
  //           const lastGround = availableSlotList[availableSlotList.length - 1].groundName;
  //           if (
  //             this.getDifference(currentHour, lastDateHour) >= oneMatchDuration && currentDay === lastDateDay
  //             || this.getDifference(currentHour, lastDateHour) <= oneMatchDuration && currentDay !== lastDateDay
  //             || (this.getDifference(currentHour, lastDateHour) <= oneMatchDuration && currentDay === lastDateDay
  //               && lastGround !== currentGround)
  //           ) {
  //             const date = new Date(JSON.parse(JSON.stringify(initialDate)));
  //             date.setHours(timing);
  //             if (availableSlotList.length < totalMatches) {
  //               availableSlotList.push({ date, groundName });
  //             }
  //           }
  //         }
  //       }
  //     };
  //     initialDate.setDate(initialDate.getDate() + 1);
  //   }
  //   availableSlotList.sort(ArraySorting.sortObjectByKey('date'));
  //   const fixturesTemp: dummyFixture[] = [];
  //   for (let index = 0; index < availableSlotList.length; index++) {
  //     let matchType: 'FKC' | 'FCP' | 'FPL' = 'FCP';
  //     if (fcpMatches && index < fcpMatches) {
  //       matchType = 'FCP';
  //     }
  //     if (fkcMatches && index >= fcpMatches) {
  //       matchType = 'FKC';
  //     }
  //     if (fplMatches && index >= (fkcMatches + fcpMatches)) {
  //       matchType = 'FPL';
  //     }
  //     fixturesTemp.push({
  //       home: 'TBD',
  //       away: 'TBD',
  //       date: availableSlotList[index].date.getTime(),
  //       concluded: false,
  //       premium: true,
  //       season: data.sName,
  //       type: matchType,
  //       locCity: 'availableSlotList[index].locCity',
  //       locState: 'availableSlotList[index].locState',
  //       stadium: availableSlotList[index].groundName,
  //     });
  //   }
  //   fixturesTemp.sort(ArraySorting.sortObjectByKey('date'));
  //   const fixtures = fixturesTemp.map((element, index) => {
  //     const i = index + 1;
  //     return {
  //       ...element,
  //       id: this.getMID(element.type, i)
  //     };
  //   });
  //   return fixtures && fixtures.length ? fixtures : [];
  // }

  getMaxSelectableSlots(): number {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    if (selectMatchTypeFormData && Object.keys(selectMatchTypeFormData).length) {
      return this.getTotalMatches(selectMatchTypeFormData.containingTournaments, selectMatchTypeFormData.participatingTeamsCount);
    }
    return 0;
  }

  getTotalMatches(tournaments: TournamentTypes[], teamsCount: number): number {
    if (!tournaments?.length || !teamsCount) {
      return 0;
    } else {
      let fcpMatches = 0;
      let fkcMatches = 0;
      let fplMatches = 0;
      if (tournaments.includes('FCP')) {
        fcpMatches = teamsCount / 2;
      }
      if (tournaments.includes('FKC')) {
        fkcMatches = teamsCount - 1;
      }
      if (tournaments.includes('FPL')) {
        fplMatches = (teamsCount * (teamsCount - 1)) / 2;
      }
      return fcpMatches + fkcMatches + fplMatches;
    }
  }

  getAdminConfigs() {
    this.ngFire.collection('adminConfigs').doc('season')
      .get()
      .subscribe({
        next: (response) => {
          this.adminConfigs = response && response.exists ? response.data() as AdminConfigurationSeason : null;
        },
        error: (error) => {
          this.adminConfigs = null;
        }
      });
  }

  getAdminConfig() {
    return this.adminConfigs;
  }

  getMappedDateRange(comparatorTimestamp: number): number {
    if (this.adminConfigs && this.adminConfigs.hasOwnProperty('lastParticipationDate') && this.adminConfigs.lastParticipationDate) {
      switch (this.adminConfigs.lastParticipationDate) {
        case LastParticipationDate.sameDate:
          return comparatorTimestamp;
        case LastParticipationDate.oneDayBefore:
          return comparatorTimestamp - MatchConstants.ONE_DAY_IN_MILLIS;
        case LastParticipationDate.threeDayBefore:
          return comparatorTimestamp - (3 * MatchConstants.ONE_DAY_IN_MILLIS);
        case LastParticipationDate.oneWeekBefore:
          return comparatorTimestamp - (7 * MatchConstants.ONE_DAY_IN_MILLIS);
      }
    }
    return comparatorTimestamp;
  }

  getPublishableFixture(data: IDummyFixture[]) {
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
    // return (startDate >= booking.bookingFrom && startDate <= booking.bookingTo);
    return false;
  }

  updateMatchReport(options: any): Promise<any> {
    if (!options) {
      return;
    }
    const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.UPDATE_MATCH_REPORT);
    return callable(options).toPromise();
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

  getStatusClass(status: statusType): any {
    switch (status) {
      case 'READY TO PUBLISH':
        return { yellow: true };
      case 'DRAFTED':
        return { grey: true };
      case 'PUBLISHED':
        return { green: true };
      case 'FINISHED':
        return { greenLight: true };
      default:
        return {};
    }
  }

  isSeasonLive(status: statusType): boolean {
    return status === 'PUBLISHED';
  }

  isSeasonFinished(status: statusType): boolean {
    return status === 'FINISHED';
  }

  onGroundSelectionChange(selection: IGroundSelection): void {
    const groundIndex = this.selectedGrounds.findIndex(value => value.id === selection.id);
    if (groundIndex > -1) {
      this.selectedGrounds[groundIndex] = selection;
    } else {
      this.selectedGrounds.push(selection);
    }
  }

  get _selectedGrounds(): IGroundSelection[] {
    return this.selectedGrounds;
  }

  resetSelectedGrounds() {
    this.selectedGrounds = [];
  }

  private getMID(type: 'FKC' | 'FPL' | 'FCP', index: number) {
    const uniqueID = this.ngFire.createId().slice(0, 8).toLocaleUpperCase();
    switch (type) {
      case 'FKC': return `${uniqueID}-${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FKC}-${index}`;
      case 'FPL': return `${uniqueID}-${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FPL}-${index}`;
      case 'FCP': return `${uniqueID}-${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FCP}-${index}`;
    }
  }

  calculateTotalLeagueMatches(teams: number): number {
    return !teams ? 0 : (teams * (teams - 1)) / 2;
  }

  calculateTotalKnockoutMatches(teams: number): number {
    return !teams ? 0 : teams - 1;
  }

  getDifference(a: number, b: number): number {
    return a - b;
  }
}
