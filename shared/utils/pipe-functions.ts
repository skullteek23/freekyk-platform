import { PlayerBasicInfo } from "@shared/interfaces/user.model";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { ArraySorting } from "./array-sorting";
import firebase from 'firebase/app';
import { SeasonBasicInfo } from "@shared/interfaces/season.model";
import { TeamBasicInfo } from "@shared/interfaces/team.model";
import { MatchFixture, ParseMatchProperties } from "@shared/interfaces/match.model";
import { GroundBasicInfo } from "@shared/interfaces/ground.model";
import { RazorPayOrder } from "@shared/interfaces/order.model";

export function manipulatePlayerData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PlayerBasicInfo), } as PlayerBasicInfo))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
    share()
  );
}

export function manipulateSeasonData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>): Observable<SeasonBasicInfo[]> {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => doc.data() as SeasonBasicInfo)),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
    share()
  );
}

export function manipulateSeasonOrdersData(source: Observable<[firebase.firestore.QuerySnapshot<unknown>, firebase.firestore.QuerySnapshot<unknown>]>): Observable<SeasonBasicInfo[]> {
  return source.pipe(
    map(response => {
      const seasonList: SeasonBasicInfo[] = [];
      if (response?.length === 2) {
        const orderList = response[1].docs.map(el => ({ id: el.id, ...el.data() as Partial<RazorPayOrder> })) || [];
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

export function manipulateUpcomingSeasonData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>): Observable<SeasonBasicInfo> {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => doc.data() as SeasonBasicInfo)),
    map(resp => resp?.length ? resp[0] : null)
  );
}

export function manipulateLiveSeasonData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    manipulateSeasonData,
    map(el => el.filter(season => season.status === 'PUBLISHED')),
  );
}

export function manipulateTeamData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as TeamBasicInfo), } as TeamBasicInfo))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('tname'))),
    share()
  );
}

export function manipulateMatchData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>): Observable<MatchFixture[]> {
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

export function manipulateFixtureData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    manipulateMatchData.bind(this),
    map((resp: MatchFixture[]) => resp.sort(ArraySorting.sortObjectByKey('date'))),
    share()
  );
}

export function manipulateResultData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    manipulateMatchData.bind(this),
    map((resp: MatchFixture[]) => resp.sort(ArraySorting.sortObjectByKey('date', 'desc'))),
    share()
  );
}

export function manipulateGroundData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as GroundBasicInfo), } as GroundBasicInfo))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
    share()
  );
}

export function getFeesAfterDiscount(fees: number, discount: number): number {
  if (fees === 0) {
    return 0;
  }
  return (fees - ((discount / 100) * fees));
}
