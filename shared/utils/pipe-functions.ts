import { PlayerBasicInfo } from "@shared/interfaces/user.model";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { ArraySorting } from "./array-sorting";
import firebase from 'firebase/app';
import { SeasonBasicInfo } from "@shared/interfaces/season.model";
import { TeamBasicInfo } from "@shared/interfaces/team.model";
import { MatchFixture, ParseMatchProperties } from "@shared/interfaces/match.model";
import { GroundBasicInfo } from "@shared/interfaces/ground.model";

export function manipulatePlayerData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PlayerBasicInfo), } as PlayerBasicInfo))),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
    share()
  );
}

export function manipulateSeasonData(source: Observable<firebase.firestore.QuerySnapshot<unknown>>) {
  return source.pipe(
    map((resp) => resp.docs.map((doc) => doc.data() as SeasonBasicInfo)),
    map(resp => resp.sort(ArraySorting.sortObjectByKey('name'))),
    map(el => el.filter(season => season.status !== 'REMOVED')),
    share()
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
