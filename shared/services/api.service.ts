import { AuthService } from '@admin/services/auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ValidationErrors } from '@angular/forms';
import { authUserMain } from '@app/services/auth.service';
import { IKnockoutData } from '@shared/components/knockout-bracket/knockout-bracket.component';
import { ITeamPlayer } from '@shared/components/team-player-members-list/team-player-members-list.component';
import { ILockedSlot, IPickupGameSlot } from '@shared/interfaces/game.model';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { IMatchRequest, MatchFixture, ParseMatchProperties, TournamentTypes } from '@shared/interfaces/match.model';
import { NotificationBasic } from '@shared/interfaces/notification.model';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { LeagueTableModel, ListOption } from '@shared/interfaces/others.model';
import { ICompletedActivity, IPoint, IPointsLog, IRedeemedReward, IReward } from '@shared/interfaces/reward.model';
import { ISeasonPartner, ISeason } from '@shared/interfaces/season.model';
import { ITeam } from '@shared/interfaces/team.model';
import { ISupportTicket } from '@shared/interfaces/ticket.model';
import { IPlayer } from '@shared/interfaces/user.model';
import { GroundAllInfo, parseFixtureData, parseGroundBulkData, parseGroundData, parseKnockoutData, parseLeagueData, parseOrderData, parseOrdersData, parsePendingOrderData, parsePickupSlotData, parsePickupSlotDataListener, parsePickupSlotsData, parsePlayerBulkData, parsePlayerDataV2, parsePlayersData, parseSeasonBulkData, parseSeasonData, parseSeasonDataV2, parseSeasonNamesData, parseSeasonPartnerData, parseSeasonTypeData, parseTeamBulkData, parseTeamData, parseTeamPlayerData, parseTeamsData, parseTicketData, parseWaitingListData, parseOnboardingStatus, parseTeamDuplicity, PlayerAllInfo, SeasonAllInfo, TeamAllInfo, parseLockedSlotData, parseCompletedActivity, parseRewardsData, parsePointsData, parseCompletedActivities, parseNotificationsData, parsePointsDataV2, parsePlayersStatsData, parseAllPointsData, parsePointLogsData, checkPendingOrderExists, checkGameOrderCancellation } from '@shared/utils/pipe-functions';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiGetService {

  constructor(
    private angularFirestore: AngularFirestore
  ) { }

  getUniqueDocID(): string {
    return this.angularFirestore.createId();
  }

  getPlayers(limit?: number): Observable<IPlayer[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('players', query).get()
      .pipe(parsePlayersData);
  }

  getPlayer(docID: string): Observable<IPlayer> {
    if (docID) {
      return this.angularFirestore.collection('players').doc(docID).get()
        .pipe(parsePlayerDataV2);
    }
  }

  getTeamPlayers(listIDs: string[]): Observable<ITeamPlayer[]> {
    if (listIDs.length) {
      return this.getPlayers()
        .pipe(parseTeamPlayerData.bind(this, listIDs))
    }
    return null;
  }

  getPlayersStats() {
    return this.angularFirestore.collection('playerStatistics').get()
      .pipe(parsePlayersStatsData)
  }

  getPlayerAllInfo(docID: string): Observable<Partial<PlayerAllInfo>> {
    if (docID) {
      return forkJoin([
        this.angularFirestore.collection('players').doc(docID).get(),
        this.angularFirestore.collection('playerStatistics').doc(docID).get()
      ]).pipe(parsePlayerBulkData)
    }
  }

  getSeasons(limit?: number): Observable<ISeason[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '!=', 'REMOVED').limit(limit);
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(parseSeasonDataV2)
  }

  getSeasonType(seasonID: string): Observable<TournamentTypes> {
    return this.angularFirestore.collection('seasons').doc(seasonID).get()
      .pipe(parseSeasonTypeData)
  }

  getSeason(docID: string): Observable<ISeason> {
    return this.angularFirestore.collection('seasons').doc(docID).get()
      .pipe(parseSeasonData)
  }

  getPublishedSeasons(limit?: number): Observable<ISeason[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(parseSeasonDataV2)
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
  //     ]).pipe(parseSeasonOrdersData)
  //   } else {
  //     return this.getPublishedSeasons(limit);
  //   }
  // }

  getLiveSeasons(): Observable<ISeason[]> {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();
    return this.angularFirestore.collection('seasons', query => query.where('lastRegDate', '>=', currentTimestamp)).get()
      .pipe(parseSeasonDataV2)
  }

  getAllMatches(limit?: number): Observable<MatchFixture[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('allMatches', query).get()
      .pipe(parseFixtureData)
  }

  getTeams(limit?: number): Observable<ITeam[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('teams', query).get()
      .pipe(parseTeamsData)
  }

  getTeam(teamID: string): Observable<ITeam> {
    return this.angularFirestore.collection('teams').doc(teamID).get()
      .pipe(parseTeamData)
  }

  getTeamAllInfo(docID: string): Observable<Partial<TeamAllInfo>> {
    if (docID) {
      return forkJoin([
        this.angularFirestore.collection('teams').doc(docID).get(),
        this.angularFirestore.collection('teamMore').doc(docID).get(),
        this.angularFirestore.collection('teamStatistics').doc(docID).get(),
        this.angularFirestore.collection('teamMedia').doc(docID).get(),
        this.angularFirestore.collection('teamMembers').doc(docID).get(),
      ]).pipe(parseTeamBulkData)
    }
    return null;
  }

  getTeamFixtures(teamID: string): Observable<MatchFixture[]> {
    if (teamID) {
      return this.angularFirestore.collection('allMatches', query => query.where('teams', 'array-contains', teamID)).get()
        .pipe(parseFixtureData)
    }
  }

  getUpcomingFixture(teamID: string): Observable<MatchFixture[]> {
    if (teamID) {
      const comparator = ParseMatchProperties.getComparatorTimestampForBackendQuery();
      const query = (query) => query.where('date', '>', comparator).where('teams', 'array-contains', teamID).orderBy('date', 'asc').limit(1)
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(parseFixtureData)
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
      .pipe(parseFixtureData)
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
      .pipe(parseFixtureData)
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
      .pipe(parseFixtureData)
  }

  getGrounds(): Observable<GroundBasicInfo[]> {
    return this.angularFirestore.collection('grounds').get()
      .pipe(parseGroundData)
  }

  getGroundAllInfo(docID: string): Observable<Partial<GroundAllInfo>> {
    return forkJoin([
      this.angularFirestore.collection('grounds').doc(docID).get(),
      this.angularFirestore.collection('groundDetails').doc(docID).get(),
    ]).pipe(parseGroundBulkData)
  }

  getSeasonAllInfo(docID: string): Observable<Partial<SeasonAllInfo>> {
    return forkJoin([
      this.angularFirestore.collection('seasons').doc(docID).get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('moreInfo').get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('statistics').get(),
      this.angularFirestore.collection(`seasons/${docID}/additionalInfo`).doc('media').get(),
    ]).pipe(parseSeasonBulkData)
  }

  getSeasonMatches(season: string): Observable<MatchFixture[]> {
    if (season) {
      const query = (query) => query.where('season', '==', season)
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(parseFixtureData)
    }
  }

  getKnockoutMatches(season: string): Observable<IKnockoutData> {
    if (season) {
      const query = (query) => query.where('season', '==', season).where('type', '==', 'FKC')
      return this.angularFirestore.collection('allMatches', query).get()
        .pipe(parseKnockoutData)
    }
  }

  getLeagueTable(season: Partial<ISeason>): Observable<LeagueTableModel[]> {
    if (season?.type === 'FPL') {
      return this.angularFirestore.collection('leagues').doc(season.id).get()
        .pipe(parseLeagueData)
    }
    return of(null);
  }

  getSeasonPartners(seasonID: string): Observable<ISeasonPartner[]> {
    if (seasonID) {
      const query = (query) => query.where('seasonID', '==', seasonID)
      return this.angularFirestore.collection('partners', query).get()
        .pipe(parseSeasonPartnerData)
    }
  }

  getUserPendingOrders(userID: string): Observable<Partial<RazorPayOrder>[]> {
    if (userID) {
      return this.angularFirestore.collection('orders', (query) => query.where('receipt', '==', userID)).get()
        .pipe(parsePendingOrderData)
    }
  }

  getUserOrders(userID: string): Observable<Partial<RazorPayOrder>[]> {
    if (userID) {
      return this.angularFirestore.collection('orders', (query) => query.where('receipt', '==', userID)).get()
        .pipe(parseOrdersData)
    }
  }

  getOrder(orderID: string): Observable<Partial<RazorPayOrder>> {
    if (orderID) {
      return this.angularFirestore.collection('orders').doc(orderID).get()
        .pipe(parseOrderData)
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
      .pipe(parseSeasonDataV2)
  }

  getLeagues(limit?: number) {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FPL').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FPL')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(parseSeasonDataV2)
  }

  getKnockouts(limit?: number) {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FKC').limit(limit);
    } else {
      query = (query) => query.where('status', '==', 'PUBLISHED').where('type', '==', 'FKC')
    }
    return this.angularFirestore.collection('seasons', query).get()
      .pipe(parseSeasonDataV2)
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
      .pipe(parseSeasonNamesData);
  }

  getSeasonBookedSlots(seasonID: string): Observable<IPickupGameSlot[]> {
    return this.angularFirestore.collection('pickupSlots', query => query.where('seasonID', '==', seasonID)).get()
      .pipe(parsePickupSlotsData)
  }

  getPickupSlot(docID: string): Observable<IPickupGameSlot> {
    if (docID) {
      return this.angularFirestore.collection('pickupSlots').doc(docID).get()
        .pipe(parsePickupSlotData)
    }
  }

  getLockedSlots(seasonID: string): Observable<ILockedSlot> {
    if (seasonID) {
      const query = query => query.where('seasonID', '==', seasonID);
      return this.angularFirestore.collection('lockedPickupSlots', query).get()
        .pipe(parseLockedSlotData)
    }
  }

  getSeasonWaitingList(seasonID: string): Observable<ListOption[]> {
    return forkJoin([
      this.angularFirestore.collection('waitingList', query => query.where('seasonID', '==', seasonID)).get(),
      this.getPlayers()
    ]).pipe(parseWaitingListData)
  }

  addSeasonSlotListener(seasonID: string): Observable<IPickupGameSlot[]> {
    return combineLatest([
      this.angularFirestore.collection('pickupSlots', query => query.where('seasonID', '==', seasonID)).snapshotChanges(),
      this.getPlayers()
    ])
      .pipe(parsePickupSlotDataListener);
  }

  getUserNotifications(userID: string): Observable<NotificationBasic[]> {
    if (userID) {
      return this.angularFirestore.collection('notifications', query => query.where('receiverID', '==', userID)).get()
        .pipe(parseNotificationsData)
    }
  }

  getUserTickets(userID: string): Observable<ISupportTicket[]> {
    return this.angularFirestore.collection('tickets', query => query.where('byUID', '==', userID)).get()
      .pipe(parseTicketData)
  }

  getAllTickets(limit?: number): Observable<ISupportTicket[]> {
    let query;
    if (limit && limit > 0) {
      query = (query) => query.limit(limit);
    }
    return this.angularFirestore.collection('tickets', query).get()
      .pipe(parseTicketData)
  }

  isActivityCompleted(activityID: number, uid: string): Observable<boolean> {
    const query = query => query.where('activityID', '==', activityID).where('uid', '==', uid);
    return this.angularFirestore.collection('completedActivities', query).get()
      .pipe(parseCompletedActivity)
  }

  isPendingOrder(uid: string): Observable<boolean> {
    const query = query => query.where('amount_due', '>=', 0).where('receipt', '==', uid);
    return this.angularFirestore.collection('orders', query).get()
      .pipe(checkPendingOrderExists)
  }

  getUserCompletedActivities(uid): Observable<ICompletedActivity[]> {
    const query = query => query.where('uid', '==', uid);
    return this.angularFirestore.collection('completedActivities', query).get()
      .pipe(parseCompletedActivities)
  }

  addUserPointsListener(uid: string) {
    return this.angularFirestore.collection('points').doc(uid).valueChanges()
      .pipe(parsePointsData)
  }

  getUserPoints(uid: string) {
    return this.angularFirestore.collection('points').doc(uid).get()
      .pipe(parsePointsDataV2)
  }

  getPoints(): Observable<IPoint[]> {
    return this.angularFirestore.collection('points').get()
      .pipe(parseAllPointsData)
  }

  getRewards(): Observable<IReward[]> {
    return this.angularFirestore.collection('rewards').get()
      .pipe(parseRewardsData)
  }

  getUserPointLogs(userID: string): Observable<IPointsLog[]> {
    return this.angularFirestore.collection('pointLogs', query => query.where('uid', '==', userID)).get()
      .pipe(parsePointLogsData)
  }

  isPickupGameOrderCancellable(season: string): Observable<boolean> {
    return this.angularFirestore.collection('allMatches', query => query.where('season', '==', season)).get()
      .pipe(checkGameOrderCancellation)
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiPostService {
  constructor(
    private angularFirestore: AngularFirestore,
    private authService: AuthService,
  ) { }

  getBatch() {
    return this.angularFirestore.firestore.batch();
  }

  savePickupSlot(doc: IPickupGameSlot): Promise<any> {
    return this.angularFirestore.collection('/pickupSlots').add(doc);
  }

  lockPickupSlot(docID: string, doc: ILockedSlot): Promise<any> {
    return this.angularFirestore.collection('/lockedPickupSlots').doc(docID).set(doc);
  }

  deleteLockedPickupSlot(docID: string): Promise<any> {
    return this.angularFirestore.collection('/lockedPickupSlots').doc(docID).delete();
  }

  savePickupSlotWithCustomID(docID: string, doc: IPickupGameSlot): Promise<any> {
    return this.angularFirestore.collection('/pickupSlots').doc(docID).set(doc);
  }

  saveTicket(doc: Partial<ISupportTicket>): Promise<any> {
    return this.angularFirestore.collection('tickets').add(doc);
  }

  deleteTicket(docID: string): Promise<any> {
    return this.angularFirestore.collection('tickets').doc(docID).delete();
  }

  saveOrder(docID: string, doc: Partial<RazorPayOrder>) {
    return this.angularFirestore.collection('/orders').doc(docID).set(doc);
  }

  saveWaitingListEntry(docID: string, doc: IPickupGameSlot): Promise<any> {
    return this.angularFirestore.collection('/waitingList').doc(docID).set(doc);
  }

  updatePickupSlot(docID: string, update: Partial<IPickupGameSlot>): Promise<any> {
    return this.angularFirestore.collection('/pickupSlots').doc(docID).update({ ...update });
  }

  deletePickupSlot(docID: string): Promise<any> {
    return this.angularFirestore.collection('/pickupSlots').doc(docID).delete();
  }

  updateTeamInfo(update: Partial<ITeam>, docID: string): Promise<any> {
    return this.angularFirestore.collection('teams').doc(docID).update({ ...update })
  }

  updateOrder(update: Partial<RazorPayOrder>, docID: string): Promise<any> {
    return this.angularFirestore.collection('orders').doc(docID).update({ ...update })
  }

  updateProfile(data: { displayName?: string, photoURL?: string }, user: authUserMain): Promise<any> {
    return user.updateProfile(data);
  }

  updatePlayerInfo(docID: string, doc: Partial<PlayerAllInfo>): Promise<any> {
    if (Object.keys(doc).length && docID) {
      const allPromises = [];
      const user = this.authService.getUser();
      allPromises.push(this.angularFirestore.collection('players').doc(docID).update({ ...doc }));
      if ((doc.name || doc.imgpath) && user) {
        allPromises.push(this.updateProfile({ displayName: doc.name, photoURL: doc.imgpath }, user));
      }

      return Promise.all(allPromises);
    }
  }

  addPlayer(data: Partial<IPlayer>): Promise<any> {
    const user = this.authService.getUser();
    if (!data || !user) {
      return Promise.reject();
    }

    const allPromises = [];
    allPromises.push(this.angularFirestore.collection('players').doc(user.uid).set(data));
    allPromises.push(this.updateProfile({ displayName: data.name, photoURL: data.imgpath }, user));

    return Promise.all(allPromises);
  }

  completeRewardableActivity(doc: ICompletedActivity): Promise<any> {
    return this.angularFirestore.collection('completedActivities').add(doc);
  }

  setUserPoints(docID: string, doc: any, doc2: IPointsLog): Promise<any> {
    if (docID && doc && doc2) {
      const batch = this.angularFirestore.firestore.batch();
      batch.update(this.angularFirestore.firestore.collection('points').doc(docID), doc);
      batch.set(this.angularFirestore.firestore.collection('pointLogs').doc(), doc2);

      return batch.commit();
    }
    return null;
  }

  setUserPointsForActivity(docID: string, doc: any, doc2: IPointsLog, doc3: ICompletedActivity): Promise<any> {
    if (docID && doc && doc2 && doc3) {
      const batch = this.angularFirestore.firestore.batch();
      batch.update(this.angularFirestore.firestore.collection('points').doc(docID), doc);
      batch.set(this.angularFirestore.firestore.collection('pointLogs').doc(), doc2);
      batch.set(this.angularFirestore.firestore.collection('completedActivities').doc(), doc3);

      return batch.commit();
    }
    return null;
  }

  setupEmptyPoints(docID: string, doc: IPoint): Promise<any> {
    return this.angularFirestore.collection('points').doc(docID).set(doc);
  }

  saveRedeemedReward(doc: IRedeemedReward): Promise<any> {
    return this.angularFirestore.collection('redeemedRewards').add(doc);
  }

  updateNotification(docID: string, doc: Partial<NotificationBasic>): Promise<any> {
    return this.angularFirestore.collection('notifications').doc(docID).update({ ...doc });
  }

  addNotification(doc: Partial<NotificationBasic>): Promise<any> {
    return this.angularFirestore.collection('notifications').add(doc);
  }

  addMatchRequest(doc: IMatchRequest): Promise<any> {
    return this.angularFirestore.collection('matchRequests').add(doc);
  }
}
