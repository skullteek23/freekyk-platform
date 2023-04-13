import { AuthService } from '@admin/services/auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ValidationErrors } from '@angular/forms';
import { authUserMain, User } from '@app/services/auth.service';
import { IKnockoutData } from '@shared/components/knockout-bracket/knockout-bracket.component';
import { ITeamPlayer } from '@shared/components/team-player-members-list/team-player-members-list.component';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { LeagueTableModel, ListOption } from '@shared/interfaces/others.model';
import { ISeasonPartner, ISeason } from '@shared/interfaces/season.model';
import { ITeam } from '@shared/interfaces/team.model';
import { ISupportTicket } from '@shared/interfaces/ticket.model';
import { IPlayer } from '@shared/interfaces/user.model';
import { GroundAllInfo, manipulateFixtureData, manipulateGroundBulkData, manipulateGroundData, manipulateKnockoutData, manipulateLeagueData, manipulateOrdersData, manipulatePendingOrderData, manipulatePickupSlotData, manipulatePickupSlotWithNamesData, manipulatePlayerBulkData, manipulatePlayerDataV2, manipulatePlayersData, manipulateSeasonBulkData, manipulateSeasonDataV2, manipulateSeasonNamesData, manipulateSeasonPartnerData, manipulateTeamBulkData, manipulateTeamData, manipulateTeamPlayerData, manipulateTeamsData, manipulateTicketData, manipulateWaitingListData, parseOnboardingStatus, parseTeamDuplicity, PlayerAllInfo, SeasonAllInfo, TeamAllInfo } from '@shared/utils/pipe-functions';
import { forkJoin, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiGetService {

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  getPlayers(limit?: number): Observable<IPlayer[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('players', query).get()
      .pipe(manipulatePlayersData);
  }

  getPlayer(docID: string): Observable<IPlayer> {
    if (docID) {
      return this.angularFirestore.collection('players').doc(docID).get()
        .pipe(manipulatePlayerDataV2);
    }
  }

  getTeamPlayers(listIDs: string[]): Observable<ITeamPlayer[]> {
    if (listIDs.length) {
      return this.getPlayers()
        .pipe(manipulateTeamPlayerData.bind(this, listIDs))
    }
    return null;
  }

  getPlayerAllInfo(docID: string): Observable<Partial<PlayerAllInfo>> {
    if (docID) {
      return forkJoin([
        this.angularFirestore.collection('players').doc(docID).get(),
        this.angularFirestore.collection('playerMore').doc(docID).get(),
        this.angularFirestore.collection('playerStatistics').doc(docID).get()
      ]).pipe(manipulatePlayerBulkData)
    }
  }

  getSeasons(limit?: number): Observable<ISeason[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '!=', 'REMOVED').limit(limit);
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonDataV2)
  }

  getPublishedSeasons(limit?: number): Observable<ISeason[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonDataV2)
  }

  // getPublishedSeasonWithPaymentInfo(limit?: number): Observable<ISeason[]> {
  //   const uid = localStorage.getItem('uid');
  //   if (uid) {
  //     let query;
  //     if (limit && limit > 0) {
  //       query = (query) => query.where('status', '==', 'PUBLISHED').limit(limit);
  //     } else {
  //       query = (query) => query.where('status', '==', 'PUBLISHED')
  //     }
  //     return forkJoin([
  //       this.angularFirestore.collection('seasons', query).get(),
  //       this.getUserOrders(uid)
  //     ]).pipe(manipulateSeasonOrdersData)
  //   } else {
  //     return this.getPublishedSeasons(limit);
  //   }
  // }

  getLiveSeasons(): Observable<ISeason[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();
    return this.angularFirestore.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).get()
      .pipe(manipulateSeasonDataV2)
  }

  getAllMatches(limit?: number): Observable<MatchFixture[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData)
  }

  getTeams(limit?: number): Observable<ITeam[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('teams', query).get()
      .pipe(manipulateTeamsData)
  }

  getTeam(teamID: string): Observable<ITeam> {
    return this.angularFirestore.collection('teams').doc(teamID).get()
      .pipe(manipulateTeamData)
  }

  getTeamAllInfo(docID: string): Observable<Partial<TeamAllInfo>> {
    if (docID) {
      return forkJoin([
        this.angularFirestore.collection('teams').doc(docID).get(),
        this.angularFirestore.collection('teamMore').doc(docID).get(),
        this.angularFirestore.collection('teamStatistics').doc(docID).get(),
        this.angularFirestore.collection('teamMedia').doc(docID).get(),
        this.angularFirestore.collection('teamMembers').doc(docID).get(),
      ]).pipe(manipulateTeamBulkData)
    }
    return null;
  }

  getTeamFixtures(teamID: string): Observable<MatchFixture[]> {
    if (teamID) {
      return this.angularFirestore.collection('allMatches', query => query.where('teams', 'array-contains', teamID)).get()
        .pipe(manipulateFixtureData)
    }
  }

  getUpcomingFixture(teamID: string): Observable<MatchFixture[]> {
    if (teamID) {
      const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
      const query = (query) => query.where('date', '>', comparator).where('teams', 'array-contains', teamID).orderBy('date', 'asc').limit(1)
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(manipulateFixtureData)
    }
  }

  getFixtures(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '>', comparator).limit(limit);
    } else {
      query = (query) => query.where('date', '>', comparator)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData)
  }

  getLiveFixtures(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    const currentTime = new Date().getTime();
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '>', comparator).where('date', '<', currentTime).limit(limit);
    } else {
      query = (query) => query.where('date', '>', comparator).where('date', '<', currentTime)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData)
  }

  getResults(limit?: number): Observable<MatchFixture[]> {
    const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('date', '<=', comparator).limit(limit);
    } else {
      query = (query) => query.where('date', '<=', comparator)
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(manipulateFixtureData)
  }

  getGrounds(): Observable<GroundBasicInfo[]> {
    return this.angularFirestore.collection('grounds').get()
      .pipe(manipulateGroundData)
  }

  getGroundAllInfo(docID: string): Observable<Partial<GroundAllInfo>> {
    return forkJoin([
      this.angularFirestore.collection('grounds').doc(docID).get(),
      this.angularFirestore.collection('groundDetails').doc(docID).get(),
    ]).pipe(manipulateGroundBulkData)
  }

  getSeasonAllInfo(docID: string): Observable<Partial<SeasonAllInfo>> {
    return forkJoin([
      this.angularFirestore.collection('seasons').doc(docID).get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('moreInfo').get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('statistics').get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('media').get(),
    ]).pipe(manipulateSeasonBulkData)
  }

  getSeasonMatches(season: string): Observable<MatchFixture[]> {
    if (season) {
      const query = (query) => query.where('season', '==', season)
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(manipulateFixtureData)
    }
  }

  getKnockoutMatches(season: string): Observable<IKnockoutData> {
    if (season) {
      const query = (query) => query.where('season', '==', season).where('type', '==', 'FKC')
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(manipulateKnockoutData)
    }
  }

  getLeagueTable(season: Partial<ISeason>): Observable<LeagueTableModel[]> {
    if (season?.type === 'FPL') {
      return this.angularFirestore.collection('leagues').doc(season.id).get()
        .pipe(manipulateLeagueData)
    }
    return of(null);
  }

  getSeasonPartners(seasonID: string): Observable<ISeasonPartner[]> {
    if (seasonID) {
      const query = (query) => query.where('seasonID', '==', seasonID)
      return this.angularFirestore.collection('partners', query).get()
        .pipe(manipulateSeasonPartnerData)
    }
  }

  getUserPendingOrders(userID: string): Observable<Partial<RazorPayOrder>[]> {
    if (userID) {
      return this.angularFirestore.collection('orders', (query) => query.where('receipt', '==', userID)).get()
        .pipe(manipulatePendingOrderData)
    }
  }

  getUserOrders(userID: string): Observable<Partial<RazorPayOrder>[]> {
    if (userID) {
      return this.angularFirestore.collection('orders', (query) => query.where('receipt', '==', userID)).get()
        .pipe(manipulateOrdersData)
    }
  }

  getCommunityPlays(limit?: number) {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FCP').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FCP')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonDataV2)
  }

  getLeagues(limit?: number) {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FPL').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FPL')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonDataV2)
  }

  getKnockouts(limit?: number) {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FKC').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FKC')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(manipulateSeasonDataV2)
  }

  checkDuplicateTeamName(comparator: string): Observable<ValidationErrors | null> {
    return this.angularFirestore.collection('teams', (query) => query.where('name', '==', comparator).limit(1)).get()
      .pipe(parseTeamDuplicity);
  }

  getPlayerOnboardingStatus(docID: string): Observable<boolean> {
    return this.angularFirestore.collection('players').doc(docID).get()
      .pipe(parseOnboardingStatus);
  }

  getSeasonNames() {
    return this.getSeasons()
      .pipe(manipulateSeasonNamesData);
  }

  getSeasonBookedSlots(seasonID: string): Observable<IPickupGameSlot[]> {
    return this.angularFirestore.collection('pickupSlots', query => query.where('seasonID', '==', seasonID)).get()
      .pipe(manipulatePickupSlotData)
  }

  getSeasonWaitingList(seasonID: string): Observable<ListOption[]> {
    return forkJoin([
      this.angularFirestore.collection('waitingList', query => query.where('seasonID', '==', seasonID)).get(),
      this.getPlayers()
    ]).pipe(manipulateWaitingListData)
  }

  getSeasonBookedSlotsWithNames(seasonID: string): Observable<IPickupGameSlot[]> {
    return forkJoin([
      this.angularFirestore.collection('pickupSlots', query => query.where('seasonID', '==', seasonID)).get(),
      this.getPlayers()
    ]).pipe(manipulatePickupSlotWithNamesData)
  }

  getUserTickets(userID: string): Observable<ISupportTicket[]> {
    return this.angularFirestore.collection('tickets', query => query.where('byUID', '==', userID)).get()
      .pipe(manipulateTicketData)
  }

  getAllTickets(limit?: number): Observable<ISupportTicket[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('tickets', query).get()
      .pipe(manipulateTicketData)
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiPostService {
  constructor(
    private angularFirestore: AngularFirestore,
    private authService: AuthService
  ) { }

  savePickupSlot(doc: IPickupGameSlot): Promise<any> {
    return this.angularFirestore.collection('/pickupSlots').add(doc);
  }

  saveTicket(doc: Partial<ISupportTicket>): Promise<any> {
    return this.angularFirestore.collection('tickets').add(doc);
  }

  deleteTicket(docID: string): Promise<any> {
    return this.angularFirestore.collection('tickets').doc(docID).delete();
  }

  saveWaitingListEntry(doc: IPickupGameSlot): Promise<any> {
    return this.angularFirestore.collection('/waitingList').add(doc);
  }

  updatePickupSlot(docID: string, update: Partial<IPickupGameSlot>): Promise<any> {
    return this.angularFirestore.collection('/pickupSlots').doc(docID).update({ ...update });
  }

  updateTeamInfo(update: Partial<ITeam>, docID: string): Promise<any> {
    return this.angularFirestore.collection('teams').doc(docID).update({ ...update })
  }

  updateProfile(data: { displayName?: string, photoURL?: string }, user: authUserMain): Promise<any> {
    return user.updateProfile(data);
  }

  addPlayer(data: Partial<IPlayer>, image: File): Promise<any> {
    const user = this.authService.getUser();
    if (!data || !user || !image) {
      return;
    }
    const allPromises = [];
    allPromises.push(this.angularFirestore.collection('players').doc(user.uid).set(data));
    allPromises.push(this.updateProfile({ displayName: data.name, photoURL: data.imgpath }, user))

    return Promise.all(allPromises);
  }
}
