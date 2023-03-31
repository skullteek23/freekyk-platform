import { BasicStats, IPlayer, IPlayerMore, IPlayerStats, PlayerBasicInfo } from "@shared/interfaces/user.model";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ArraySorting } from "./array-sorting";
import firebase from 'firebase/app';
import { ISeason, ISeasonDescription, ISeasonPartner, SeasonAbout, SeasonBasicInfo, SeasonMedia, SeasonStats } from "@shared/interfaces/season.model";
import { ITeam, ITeamDescription, ITeamMembers, TeamBasicInfo, TeamMedia, TeamMembers, TeamStats } from "@shared/interfaces/team.model";
import { MatchFixture, ParseMatchProperties } from "@shared/interfaces/match.model";
import { GroundBasicInfo, GroundMoreInfo } from "@shared/interfaces/ground.model";
import { RazorPayOrder } from "@shared/interfaces/order.model";
import { LeagueTableModel } from "@shared/interfaces/others.model";
import { IKnockoutData } from "@shared/components/knockout-bracket/knockout-bracket.component";
import { ValidationErrors } from "@angular/forms";
import { ITeamPlayer } from "@shared/components/team-player-members-list/team-player-members-list.component";

// export interface SeasonAllInfo extends SeasonBasicInfo, SeasonAbout, SeasonStats, SeasonMedia { };
export interface SeasonAllInfo extends ISeason, ISeasonDescription, SeasonStats, SeasonMedia { };
export interface TeamAllInfo extends ITeam, ITeamDescription, ITeamMembers, TeamMedia, TeamStats { };
export interface GroundAllInfo extends GroundBasicInfo, GroundMoreInfo { };
export interface PlayerAllInfo extends IPlayer, IPlayerMore, BasicStats { };

export type ngFireDoc = firebase.firestore.DocumentSnapshot<unknown>;
export type ngFireDocQuery = firebase.firestore.QuerySnapshot<unknown>;

export function manipulatePlayersData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as IPlayer), } as IPlayer))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}
export function manipulateTeamPlayerData(list: string[], source: Observable<IPlayer[]>): Observable<ITeamPlayer[]> {
  return source.pipe(
    map((resp) => resp
      .filter(player => list.includes(player.id))
      .map(player => ({ name: player.name, id: player.id, position: player.position, imgpath: player.imgpath }))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('position'))),
  );
}

export function manipulatePlayerData(source: Observable<ngFireDoc>): Observable<PlayerBasicInfo> {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as PlayerBasicInfo), } as PlayerBasicInfo)),
  );
}

export function manipulatePlayerDataV2(source: Observable<ngFireDoc>): Observable<IPlayer> {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as IPlayer), } as IPlayer)),
  );
}

export function manipulateSeasonData(source: Observable<ngFireDocQuery>): Observable<SeasonBasicInfo[]> {
  return source.pipe(
    map(response => {
      const seasonList: SeasonBasicInfo[] = [];
      if (!response.empty) {
        response.forEach(season => {
          const docData = season.data() as SeasonBasicInfo;
          const docID = season.id;
          docData.discountedFees = getFeesAfterDiscount(docData.feesPerTeam, docData.discount);
          docData.slotBooked = false;
          docData.isAmountDue = null;
          docData.isFreeSeason = docData.discountedFees === 0;
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

export function manipulateSeasonDataV2(source: Observable<ngFireDocQuery>): Observable<ISeason[]> {
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
      } else {
        seasonList = [
          {
            name: 'WellClub A',
            imgpath: null,
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            fees: 2500,
            type: 'FCP',
            startDate: new Date().getTime(),
            participatingTeams: 4,
            status: 'PUBLISHED',
            createdBy: 'asjkgkj2g3kj52g3',
            lastRegistrationDate: new Date().getTime() + 10000000,
            ageCategory: 99,
            leftOverMatchCount: 1
          },
          {
            name: 'WellClub A',
            imgpath: null,
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            fees: 2500,
            type: 'FCP',
            startDate: new Date().getTime(),
            participatingTeams: 4,
            status: 'PUBLISHED',
            createdBy: 'asjkgkj2g3kj52g3',
            lastRegistrationDate: new Date().getTime() + 10000000,
            ageCategory: 99,
            leftOverMatchCount: 1
          },
          {
            name: 'WellClub A',
            imgpath: null,
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            fees: 2500,
            type: 'FCP',
            startDate: new Date().getTime(),
            participatingTeams: 4,
            status: 'PUBLISHED',
            createdBy: 'asjkgkj2g3kj52g3',
            lastRegistrationDate: new Date().getTime() + 10000000,
            ageCategory: 99,
            leftOverMatchCount: 1

          },
          {
            name: 'WellClub A',
            imgpath: null,
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            fees: 2500,
            type: 'FCP',
            startDate: new Date().getTime(),
            participatingTeams: 4,
            status: 'PUBLISHED',
            createdBy: 'asjkgkj2g3kj52g3',
            lastRegistrationDate: new Date().getTime() + 10000000,
            ageCategory: 99,
            leftOverMatchCount: 1

          },
          {
            name: 'WellClub A',
            imgpath: null,
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            fees: 2500,
            type: 'FCP',
            startDate: new Date().getTime(),
            participatingTeams: 4,
            status: 'PUBLISHED',
            createdBy: 'asjkgkj2g3kj52g3',
            lastRegistrationDate: new Date().getTime() + 10000000,
            ageCategory: 99,
            leftOverMatchCount: 1

          }
        ];
      }
      return seasonList;
    }),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}

export function manipulateSeasonBulkData(source: Observable<[ngFireDoc, ngFireDoc, ngFireDoc, ngFireDoc]>): Observable<Partial<SeasonAllInfo>> {
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

export function manipulatePlayerBulkData(source: Observable<[ngFireDoc, ngFireDoc, ngFireDoc]>): Observable<Partial<PlayerAllInfo>> {
  return source.pipe(
    map(response => {
      let data: Partial<PlayerAllInfo> = {};
      if (response?.length === 3) {
        const data_1: IPlayer = response[0].exists ? ({ id: response[0].id, ...response[0].data() as IPlayer }) : null;
        const data_2: IPlayerMore = response[1].exists ? ({ ...response[1].data() as IPlayerMore }) : null;
        const data_3: IPlayerStats = response[2].exists ? ({ ...response[2].data() as IPlayerStats }) : null;
        if (data_1 || data_2 || data_3) {
          data = {
            ...data_1,
            ...data_2,
            ...data_3,
          }
          return data;
        }
        return null;
      }
      return null;
    }),
  );
}

export function manipulateTeamBulkData(source: Observable<[ngFireDoc, ngFireDoc, ngFireDoc, ngFireDoc, ngFireDoc]>): Observable<Partial<TeamAllInfo>> {
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

export function manipulateGroundBulkData(source: Observable<[ngFireDoc, ngFireDoc]>): Observable<Partial<GroundAllInfo>> {
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

export function manipulateSeasonOrdersData(source: Observable<[ngFireDocQuery, Partial<RazorPayOrder>[]]>): Observable<SeasonBasicInfo[]> {
  return source.pipe(
    map(response => {
      const seasonList: SeasonBasicInfo[] = [];
      if (response?.length === 2) {
        const orderList = response[1];
        response[0].forEach(season => {
          const docData = season.data() as SeasonBasicInfo;
          const docID = season.id;
          const slotExists = orderList.find(order => order.seasonID === docID);

          docData.discountedFees = getFeesAfterDiscount(docData.feesPerTeam, docData.discount);
          if (slotExists) {
            docData.slotBooked = true;
            docData.isAmountDue = slotExists.amount_due / 100; // in rupees
          } else {
            docData.slotBooked = false;
            docData.isAmountDue = null;
          }
          docData.isFreeSeason = docData.discountedFees === 0;
          if (docData.status === 'PUBLISHED') {
            seasonList.push({ id: docID, ...docData });
          }
        });
      }
      return seasonList;
    }),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('isAmountDue', 'desc'))),
  );
}

export function manipulateTeamsData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ITeam), } as ITeam))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}

export function manipulateTeamData(source: Observable<ngFireDoc>) {
  return source.pipe(
    map((resp) => ({ id: resp.id, ...(resp.data() as ITeam), } as ITeam)),
  );
}

export function manipulateOrdersData(source: Observable<ngFireDocQuery>): Observable<Partial<RazorPayOrder>[]> {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Partial<RazorPayOrder>), } as Partial<RazorPayOrder>))),
  );
}

export function manipulateMatchData(source: Observable<ngFireDocQuery>): Observable<MatchFixture[]> {
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

export function manipulateFixtureData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    manipulateMatchData,
    map((resp: MatchFixture[]) => resp.sort(ArraySorting.sortObjectByKey('date'))),
  );
}

export function manipulateResultData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    manipulateMatchData,
    map((resp: MatchFixture[]) => resp.sort(ArraySorting.sortObjectByKey('date', 'desc'))),
  );
}

export function manipulateGroundData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as GroundBasicInfo), } as GroundBasicInfo))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
  );
}

export function manipulateSeasonPartnerData(source: Observable<ngFireDocQuery>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as ISeasonPartner), } as ISeasonPartner))),
  );
}

export function manipulatePendingOrderData(source: Observable<ngFireDocQuery>): Observable<Partial<RazorPayOrder>[]> {
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

export function manipulateLeagueData(source: Observable<ngFireDoc>): Observable<LeagueTableModel[]> {
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

export function manipulateKnockoutData(source: Observable<ngFireDocQuery>): Observable<IKnockoutData> {
  return source.pipe(
    manipulateMatchData,
    map((resp: MatchFixture[]) => createKnockoutData(resp)),
  );
}



function getFeesAfterDiscount(fees: number, discount: number): number {
  if (fees === 0) {
    return 0;
  }
  return (fees - ((discount / 100) * fees));
}

function createKnockoutData(matches: MatchFixture[]): IKnockoutData {
  if (matches?.length) {
    const round2matches = matches.filter(el => el.fkcRound === 2);
    const round4matches = matches.filter(el => el.fkcRound === 4);
    const round8matches = matches.filter(el => el.fkcRound === 8);
    const round16matches = matches.filter(el => el.fkcRound === 16);

    const data: Partial<IKnockoutData> = {};
    data.match = round2matches[0];
    if (round4matches.length) {
      data.next = [
        {
          match: round4matches[0]
        },
        {
          match: round4matches[1]
        },
      ]
    }

    if (round8matches.length) {
      data.next[0].next = [
        {
          match: round8matches[0]
        },
        {
          match: round8matches[1]
        },
      ]
      data.next[1].next = [
        {
          match: round8matches[2]
        },
        {
          match: round8matches[3]
        },
      ]
    }

    if (round16matches.length) {
      data.next[0].next[0].next = [
        {
          match: round16matches[0]
        },
        {
          match: round16matches[1]
        },
      ]
      data.next[1].next[0].next = [
        {
          match: round16matches[2]
        },
        {
          match: round16matches[3]
        }
      ]
      data.next[0].next[1].next = [
        {
          match: round16matches[4]
        },
        {
          match: round16matches[5]
        }
      ]
      data.next[1].next[1].next = [
        {
          match: round16matches[6]
        },
        {
          match: round16matches[7]
        }
      ]
    }

    return data as IKnockoutData;
  }
  return null;
}
