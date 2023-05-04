import { BasicStats, IPlayer, IPlayerStats, PlayerBasicInfo } from "@shared/interfaces/user.model";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ArraySorting } from "./array-sorting";
import firebase from 'firebase/app';
import { ISeason, ISeasonDescription, ISeasonPartner, SeasonMedia, SeasonStats } from "@shared/interfaces/season.model";
import { ITeam, ITeamDescription, ITeamMembers, TeamMedia, TeamStats } from "@shared/interfaces/team.model";
import { MatchFixture, ParseMatchProperties, TournamentTypes } from "@shared/interfaces/match.model";
import { GroundBasicInfo, GroundMoreInfo } from "@shared/interfaces/ground.model";
import { RazorPayOrder } from "@shared/interfaces/order.model";
import { LeagueTableModel, ListOption } from "@shared/interfaces/others.model";
import { IKnockoutData } from "@shared/components/knockout-bracket/knockout-bracket.component";
import { ValidationErrors } from "@angular/forms";
import { ITeamPlayer } from "@shared/components/team-player-members-list/team-player-members-list.component";
import { ILockedSlot, IPickupGameSlot } from "@shared/interfaces/game.model";
import { ISupportTicket } from "@shared/interfaces/ticket.model";
import { DocumentChangeAction } from "@angular/fire/firestore";
import { ICompletedActivity, IPoint, IReward } from "@shared/interfaces/reward.model";
import { NotificationBasic } from "@shared/interfaces/notification.model";
import { createKnockoutData } from "./custom-functions";
import { NotificationTypes } from "@shared/interfaces/notification.model";

// export interface SeasonAllInfo extends ISeason, SeasonAbout, SeasonStats, SeasonMedia { };
export interface SeasonAllInfo extends ISeason, ISeasonDescription, SeasonStats, SeasonMedia { };
export interface TeamAllInfo extends ITeam, ITeamDescription, ITeamMembers, TeamMedia, TeamStats { };
export interface GroundAllInfo extends GroundBasicInfo, GroundMoreInfo { };
export interface PlayerAllInfo extends IPlayer, BasicStats { };

export type ngFireDoc = firebase.firestore.DocumentSnapshot<unknown>;
export type ngFireDocQuery = firebase.firestore.QuerySnapshot<unknown>;
export type ngFireSnapshotChange = DocumentChangeAction<unknown>[];

export function parsePlayersData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as IPlayer), } as IPlayer))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}
export function parseTeamPlayerData(list: string[], source: Observable<IPlayer[]>): Observable<ITeamPlayer[]> {
  return source.pipe(
    map((resp) => resp
      .filter(player => list.includes(player.id))
      .map(player => ({ name: player.name, id: player.id, position: player.position, imgpath: player.imgpath }))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('position'))),
  );
}

export function parsePlayerData(source: Observable<ngFireDoc>): Observable<PlayerBasicInfo> {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as PlayerBasicInfo), } as PlayerBasicInfo)),
  );
}

export function parsePlayerDataV2(source: Observable<ngFireDoc>): Observable<IPlayer> {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as IPlayer), } as IPlayer)),
  );
}

// export function parseSeasonData(source: Observable<ngFireDocQuery>): Observable<ISeason[]> {
//   return source.pipe(
//     map(response => {
//       const seasonList: ISeason[] = [];
//       if (!response.empty) {
//         response.forEach(season => {
//           const docData = season.data() as ISeason;
//           const docID = season.id;
//           docData.discountedFees = getFeesAfterDiscount(docData.feesPerTeam, docData.discount);
//           docData.slotBooked = false;
//           docData.isAmountDue = null;
//           docData.isFreeSeason = docData.discountedFees === 0;
//           if (docData.status === 'PUBLISHED') {
//             seasonList.push({ id: docID, ...docData });
//           }
//         });
//       }
//       return seasonList;
//     }),
//     map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
//   );
// }

export function parseSeasonDataV2(source: Observable<ngFireDocQuery>): Observable<ISeason[]> {
  return source.pipe(
    map(response => {
      let seasonList: ISeason[] = [];
      if (!response.empty) {
        response.forEach(season => {
          const docData = season.data() as ISeason;
          const docID = season.id;
          if (docData.status === 'PUBLISHED') {
            seasonList.push({ id: docID, ...docData });
          }
        });
      }
      return seasonList;
    }),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}

export function parseSeasonNamesData(source: Observable<ISeason[]>): Observable<string[]> {
  return source.pipe(
    map(resp => resp.map(resp => resp.name))
  );
}

export function parseSeasonData(source: Observable<ngFireDoc>): Observable<ISeason> {
  return source.pipe(
    map(resp => ({ id: resp.id, ...resp.data() as ISeason }))
  );
}

export function parseSeasonTypeData(source: Observable<ngFireDoc>): Observable<TournamentTypes> {
  return source.pipe(
    map(resp => resp.exists ? (resp.data() as ISeason).type : null)
  );
}

export function parsePickupSlotsData(source: Observable<ngFireDocQuery>): Observable<IPickupGameSlot[]> {
  return source.pipe(
    map((resp) => resp.docs.map(res => ({ id: res.id, ...(res.data() as IPickupGameSlot), } as IPickupGameSlot)))
  );
}

export function parseLockedSlotData(source: Observable<ngFireDocQuery>): Observable<ILockedSlot> {
  return source.pipe(
    map((resp) => {
      if (resp && !resp.empty) {
        return resp.docs[0].data() as ILockedSlot;
      }
      return null;
    })
  );
}

export function parsePickupSlotData(source: Observable<ngFireDoc>): Observable<IPickupGameSlot> {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as IPickupGameSlot), } as IPickupGameSlot))
  );
}

export function parsePickupSlotDataListener(source: Observable<[ngFireSnapshotChange, IPlayer[]]>): Observable<IPickupGameSlot[]> {
  return source.pipe(
    map((resp) => {
      if (resp?.length && resp[0]) {
        const players = resp[1];
        const temp = resp[0];
        const list: IPickupGameSlot[] = [];
        if (temp) {
          temp.forEach(element => {
            const dataID = element.payload.doc.id;
            const data = element.payload.doc.data() as IPickupGameSlot;
            const player = players.find(el => el.id === data.uid);
            if (element.payload.doc.exists && player) {
              list.push({ ...data, id: dataID, name: player.name })
            }
          })
        }
        return list;
      } else {
        return null;
      }
    })
  );
}

export function parseWaitingListData(source: Observable<[ngFireDocQuery, IPlayer[]]>): Observable<ListOption[]> {
  return source.pipe(
    map(resp => {
      let list: ListOption[] = [];
      if (resp.length === 2 && !resp[0].empty) {
        const slotsTemp = resp[0].docs.map(res => ({ id: res.id, ...(res.data() as IPickupGameSlot), } as IPickupGameSlot));
        slotsTemp.sort(ArraySorting.sortObjectByKey('timestamp'));
        const players = resp[1];
        slotsTemp.forEach(element => {
          const playerData = players.find(el => el.id === element.uid);
          if (playerData) {
            list.push({ value: element.uid, viewValue: playerData.name });
          }
        })
      }
      return list;
    }),
  );
}

export function parsePickupSlotWithNamesData(list: IPickupGameSlot[], source: Observable<IPlayer[]>): Promise<IPickupGameSlot[]> {
  return source.pipe(
    map(resp => {
      let pickupSlots: IPickupGameSlot[] = [];
      if (resp) {
        const players = resp;
        pickupSlots = list.map(slot => ({ ...slot, name: players.find(el => el.id === slot.uid).name }));
      }
      return pickupSlots.sort(ArraySorting.sortObjectByKey('name'));
    })
  ).toPromise();
}

export function parseSeasonBulkData(source: Observable<[ngFireDoc, ngFireDoc, ngFireDoc, ngFireDoc]>): Observable<Partial<SeasonAllInfo>> {
  return source.pipe(
    map(response => {
      let data: Partial<SeasonAllInfo> = {};
      if (response?.length === 4) {
        const data_1: ISeason = response[0].exists ? ({ id: response[0].id, ...response[0].data() as ISeason }) : null;
        const data_2: ISeasonDescription = response[1].exists ? ({ ...response[1].data() as ISeasonDescription }) : null;
        const data_3: SeasonStats = response[2].exists ? ({ ...response[2].data() as SeasonStats }) : null;
        const data_4: SeasonMedia = response[3].exists ? ({ ...response[3].data() as SeasonMedia }) : null;
        if (data_1 || data_2 || data_3 || data_4) {
          data = {
            ...data_1,
            ...data_2,
            ...data_3,
            ...data_4,
          }
          return data;
        }
        return null;
      }
      return null;
    }),
  );
}

export function parsePlayerBulkData(source: Observable<[ngFireDoc, ngFireDoc]>): Observable<Partial<PlayerAllInfo>> {
  return source.pipe(
    map(response => {
      let data: Partial<PlayerAllInfo> = {};
      if (response?.length === 2) {
        const data_1: IPlayer = response[0].exists ? ({ id: response[0].id, ...response[0].data() as IPlayer }) : null;
        const data_2: IPlayerStats = response[1].exists ? ({ ...response[1].data() as IPlayerStats }) : null;
        if (data_1 || data_2) {
          data = {
            ...data_1,
            ...data_2,
          }
          return data;
        }
        return null;
      }
      return null;
    }),
  );
}

export function parseTeamBulkData(source: Observable<[ngFireDoc, ngFireDoc, ngFireDoc, ngFireDoc, ngFireDoc]>): Observable<Partial<TeamAllInfo>> {
  return source.pipe(
    map(response => {
      let data: Partial<TeamAllInfo> = {};
      if (response?.length === 5) {
        const data_1: ITeam = response[0].exists ? ({ id: response[0].id, ...response[0].data() as ITeam }) : null;
        const data_2: ITeamDescription = response[1].exists ? ({ ...response[1].data() as ITeamDescription }) : null;
        const data_3: TeamStats = response[2].exists ? ({ ...response[2].data() as TeamStats }) : null;
        const data_4: ITeamMembers = response[3].exists ? ({ ...response[3].data() as ITeamMembers }) : null;
        const data_5: TeamMedia = response[4].exists ? ({ ...response[4].data() as TeamMedia }) : null;

        if (data_1 || data_2 || data_3 || data_4 || data_5) {
          data = {
            ...data_1,
            ...data_2,
            ...data_3,
            ...data_4,
            ...data_5,
          }
          return data;
        }
        return null;
      }
      return null;
    }),
  );
}

export function parseGroundBulkData(source: Observable<[ngFireDoc, ngFireDoc]>): Observable<Partial<GroundAllInfo>> {
  return source.pipe(
    map(response => {
      let data: Partial<GroundAllInfo> = {};
      if (response?.length === 2) {
        const data_1: GroundBasicInfo = response[0].exists ? ({ id: response[0].id, ...response[0].data() as GroundBasicInfo }) : null;
        const data_2: GroundMoreInfo = response[1].exists ? ({ ...response[1].data() as GroundMoreInfo }) : null;

        if (data_1 || data_2) {
          data = {
            ...data_1,
            ...data_2,
          }
          return data;
        }
        return null;
      }
      return null;
    }),
  );
}

// export function parseSeasonOrdersData(source: Observable<[ngFireDocQuery, Partial<RazorPayOrder>[]]>): Observable<ISeason[]> {
//   return source.pipe(
//     map(response => {
//       const seasonList: ISeason[] = [];
//       if (response?.length === 2) {
//         const orderList = response[1];
//         response[0].forEach(season => {
//           const docData = season.data() as ISeason;
//           const docID = season.id;
//           const slotExists = orderList.find(order => order.seasonID === docID);

//           docData.discountedFees = getFeesAfterDiscount(docData.feesPerTeam, docData.discount);
//           if (slotExists) {
//             docData.slotBooked = true;
//             docData.isAmountDue = slotExists.amount_due / 100; // in rupees
//           } else {
//             docData.slotBooked = false;
//             docData.isAmountDue = null;
//           }
//           docData.isFreeSeason = docData.discountedFees === 0;
//           if (docData.status === 'PUBLISHED') {
//             seasonList.push({ id: docID, ...docData });
//           }
//         });
//       }
//       return seasonList;
//     }),
//     map(resp => resp.sort(ArraySorting.sortObjectByKey('isAmountDue', 'desc'))),
//   );
// }

export function parseTeamsData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ITeam), } as ITeam))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}

export function parseTeamData(source: Observable<ngFireDoc>) {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as ITeam), } as ITeam)),
  );
}

export function parseOrdersData(source: Observable<ngFireDocQuery>): Observable<Partial<RazorPayOrder>[]> {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Partial<RazorPayOrder>), } as Partial<RazorPayOrder>))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('created_at', 'desc'))),
  );
}

export function parseOrderData(source: Observable<ngFireDoc>): Observable<Partial<RazorPayOrder>> {
  return source.pipe(
    map((resp) => resp.exists ? ({ id: resp.id, ...(resp.data() as Partial<RazorPayOrder>), } as Partial<RazorPayOrder>) : null),
  );
}

export function parseMatchData(source: Observable<ngFireDocQuery>): Observable<MatchFixture[]> {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => {
      const data = doc.data() as MatchFixture;
      const id = doc.id;
      const status = ParseMatchProperties.getTimeDrivenStatus(data.status, data.date);
      const match: MatchFixture = {
        ...data,
        id,
        status
      };
      return match;
    })),
  );
}

export function parseFixtureData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    parseMatchData,
    map((resp: MatchFixture[]) => resp.sort(ArraySorting.sortObjectByKey('date'))),
  );
}

export function parseTicketData(source: Observable<ngFireDocQuery>): Observable<ISupportTicket[]> {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ISupportTicket), } as ISupportTicket))),
    map((resp: ISupportTicket[]) => resp.sort(ArraySorting.sortObjectByKey('timestamp', 'desc'))),
  );
}

export function parseNotificationsData(source: Observable<ngFireDocQuery>): Observable<NotificationBasic[]> {
  return source.pipe(
    map((resp) => resp.empty ? [] : resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as NotificationBasic), } as NotificationBasic))),
    map((resp: NotificationBasic[]) => resp.sort(ArraySorting.sortObjectByKey('date', 'desc'))),
  );
}

export function parseResultData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    parseMatchData,
    map((resp: MatchFixture[]) => resp.sort(ArraySorting.sortObjectByKey('date', 'desc'))),
  );
}

export function parseGroundData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as GroundBasicInfo), } as GroundBasicInfo))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}

export function parseSeasonPartnerData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ISeasonPartner), } as ISeasonPartner))),
  );
}

export function parsePendingOrderData(source: Observable<ngFireDocQuery>): Observable<Partial<RazorPayOrder>[]> {
  return source.pipe(
    map((resp) => {
      const data: Partial<RazorPayOrder>[] = [];
      resp.docs.map((doc) => {
        const docData = doc.data() as Partial<RazorPayOrder>;
        if (docData.amount_due > 0) {
          data.push({ ...docData, amount_due: docData.amount_due / 100 });
        }
      })
      return data;
    }
    ),
  );
}

export function parseLeagueData(source: Observable<ngFireDoc>): Observable<LeagueTableModel[]> {
  return source.pipe(
    map((resp) => {
      let tableData: LeagueTableModel[] = [];

      if (resp?.exists) {
        tableData = Object.values(resp.data())
      }
      return tableData;
    }),
  );
}

export function parseTeamDuplicity(source: Observable<ngFireDocQuery>): Observable<ValidationErrors | null> {
  return source.pipe(
    map(resp => resp.empty ? null : { nameTaken: true })
  )
}

export function parseOnboardingStatus(source: Observable<ngFireDoc>): Observable<boolean> {
  return source.pipe(map(resp => resp.exists))
}

export function parseKnockoutData(source: Observable<ngFireDocQuery>): Observable<IKnockoutData> {
  return source.pipe(
    parseMatchData,
    map((resp: MatchFixture[]) => createKnockoutData(resp)),
  );
}

export function parseCompletedActivity(source: Observable<ngFireDocQuery>): Observable<boolean> {
  return source.pipe(map((resp) => !resp.empty));
}

export function parseCompletedActivities(source: Observable<ngFireDocQuery>): Observable<ICompletedActivity[]> {
  return source.pipe(map((resp) => resp?.empty ? [] : resp.docs.map(doc => ({ id: doc.id, ...doc.data() as ICompletedActivity }))));
}

export function parsePointsData(source: Observable<IPoint>): Observable<IPoint> {
  return source.pipe(map((resp) => resp ? (resp as IPoint) : null));
}

export function parsePointsDataV2(source: Observable<ngFireDoc>): Observable<IPoint> {
  return source.pipe(map((resp) => resp ? (resp.data() as IPoint) : null));
}

export function parseRewardsData(source: Observable<ngFireDocQuery>): Observable<IReward[]> {
  return source.pipe(
    map((resp) => !resp?.empty ? resp.docs.map(doc => ({ id: doc.id, ...doc.data() as IReward })) : []),
  );
}
