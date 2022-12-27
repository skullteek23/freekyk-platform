import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { GroundBooking, IGroundSelection, OWNERSHIP_TYPES } from '@shared/interfaces/ground.model';
import { IDummyFixture, TournamentTypes, } from '@shared/interfaces/match.model';
import { IDummyFixtureOptions, ISeasonCloudFnData, ISeasonDetails, ISeasonFixtures, ISelectGrounds, ISelectMatchType, ISelectTeam, LastParticipationDate, statusType } from '@shared/interfaces/season.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstants, MatchConstantsSecondary } from '@shared/constants/constants';
import { AdminConfigurationSeason } from '@shared/interfaces/admin.model';
import { AngularFireStorage } from '@angular/fire/storage';

export interface Slot {
  name: string;
  locState: string;
  locCity: string;
  ownType: OWNERSHIP_TYPES;
  slot: number;
}

@Injectable({
  providedIn: 'root'
})
export class SeasonAdminService {

  private adminConfigs: AdminConfigurationSeason;
  private selectedGrounds: IGroundSelection[] = [];
  private selectedFile: File;

  constructor(
    private ngFire: AngularFirestore,
    private ngFunctions: AngularFireFunctions,
    private ngStorage: AngularFireStorage
  ) {
    this.getAdminConfigs();
  }

  getDummyFixtures(options: IDummyFixtureOptions): IDummyFixture[] {
    if (!options || Object.keys(options).length === 0) {
      return [];
    }
    const fixtures: IDummyFixture[] = [];
    const groundSlots: Slot[] = [];
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

  clearSavedData() {
    sessionStorage.removeItem('selectMatchType');
    sessionStorage.removeItem('selectTeam');
    sessionStorage.removeItem('selectGround');
    sessionStorage.removeItem('seasonFixtures');
    sessionStorage.removeItem('seasonDetails');
  }

  publishSeason(seasonID: string): Promise<any> {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    const selectTeamFormData: ISelectTeam = JSON.parse(sessionStorage.getItem('selectTeam'));
    const selectGroundFormData: ISelectGrounds = JSON.parse(sessionStorage.getItem('selectGround'));
    const seasonFixturesFormData: ISeasonFixtures = JSON.parse(sessionStorage.getItem('seasonFixtures'));
    const seasonDetailsFormData: ISeasonDetails = JSON.parse(sessionStorage.getItem('seasonDetails'));
    const uid = sessionStorage.getItem('uid');
    if (selectMatchTypeFormData && selectGroundFormData && seasonFixturesFormData && seasonDetailsFormData && seasonID && uid) {
      const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.PUBLISH_SEASON);
      const data: ISeasonCloudFnData = {
        matchType: selectMatchTypeFormData,
        seasonDetails: seasonDetailsFormData,
        fixtures: seasonFixturesFormData,
        teams: selectTeamFormData,
        grounds: selectGroundFormData,
        seasonID,
        adminID: uid
      }
      return callable(data).toPromise();
    }
    return null;
  }

  setSelectedFile(fileObj: File) {
    this.selectedFile = fileObj;
  }

  async uploadSeasonPhoto(seasonID: string): Promise<any> {
    if (!this.selectedFile) {
      return Promise.reject({
        message: 'Unable to upload Season Photo!'
      });
    }
    const imgpath: string = await this.getImageURL(this.selectedFile);
    if (imgpath) {
      return this.ngFire.collection('seasons').doc(seasonID).update({ imgpath });
    } else {
      return this.ngFire.collection('seasons').doc(seasonID).update({ imgpath: MatchConstantsSecondary.DEFAULT_IMAGE_URL });
    }
  }

  async getImageURL(fileObj: File): Promise<string> {
    if (fileObj && fileObj.name) {
      const imageSnapshot = await this.ngStorage.upload('/seasonImages/' + fileObj.name.trim(), fileObj);
      return await imageSnapshot.ref.getDownloadURL();
    }
    return null;
  }

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
        fcpMatches = this.calculateTotalCPMatches(teamsCount);
      }
      if (tournaments.includes('FKC')) {
        fkcMatches = this.calculateTotalKnockoutMatches(teamsCount);
      }
      if (tournaments.includes('FPL')) {
        fplMatches = this.calculateTotalLeagueMatches(teamsCount);
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

  getMappedDateRange(): number {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    const comparatorTimestamp = new Date(selectMatchTypeFormData.startDate).getTime();
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

  getSeasonFixtureDrafts(draftID): Observable<any> {
    if (draftID) {
      return this.ngFire.collection('seasonFixturesDrafts', query => query.where('draftID', '==', draftID))
        .get()
        .pipe(map(resp => resp.docs.map(doc => doc.exists ? doc.id : null)));
    }
  }

  getStatusClass(status: statusType): any {
    switch (status) {
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

  checkSeasonName(input: string) {
    return this.ngFire
      .collection('seasons', (query) =>
        query.where('name', '==', input).limit(1)
      )
      .get()
      .pipe(
        map((responseData) => (responseData.empty ? null : { nameTaken: true }))
      );
  }

  get _selectedGrounds(): IGroundSelection[] {
    return this.selectedGrounds;
  }

  resetSelectedGrounds() {
    this.selectedGrounds = [];
  }

  private getMID(type: TournamentTypes, index: number) {
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

  calculateTotalCPMatches(teams: number): number {
    return !teams ? 0 : teams / 2;
  }

  getDifference(a: number, b: number): number {
    return a - b;
  }
}
