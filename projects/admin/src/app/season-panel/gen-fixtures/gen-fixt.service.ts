import { Injectable } from '@angular/core';
import { dummyFixture, MatchFixture, MatchFixtureOverview, MatchLineup } from 'src/app/shared/interfaces/match.model';
import { CloudFunctionFixtureData } from 'src/app/shared/interfaces/others.model';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from "firebase/app";
import { MatchConstants, MatchConstantsSecondary } from '../../shared/constants/constants';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { element } from 'protractor';

@Injectable({
  providedIn: 'root',
})

export class GenFixtService {
  onGenerateDummyFixtures(data: CloudFunctionFixtureData) {
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
        date: availableSlotList[index].date,
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
        mid: this.getMID(element.type, i)
      }
    })
    return (fixtures);
  }

  getPublishableFixture(data: dummyFixture[]) {
    return data.map(val => {
      const newId = this.ngFire.createId();
      return {
        id: newId,
        mid: val.mid,
        date: firebase.firestore.Timestamp.fromDate(val.date),
        concluded: false,
        teams: [MatchConstantsSecondary.TO_BE_DECIDED, MatchConstantsSecondary.TO_BE_DECIDED],
        logos: [MatchConstantsSecondary.DEFAULT_LOGO, MatchConstantsSecondary.DEFAULT_LOGO],
        season: val.season,
        premium: val.premium,
        type: val.type,
        locCity: val.locCity,
        locState: val.locState,
        stadium: val.stadium,
      } as MatchFixture;
    })
  }

  updateGroundAvailability(groundIds: string[] = [], lastUnavailableDate: Date) {
    let allAsyncPromises = [];
    lastUnavailableDate.setDate(lastUnavailableDate.getDate() + 1);
    lastUnavailableDate.setHours(0);
    lastUnavailableDate.setMinutes(0);
    const lastAvailableDate = new Date(JSON.parse(JSON.stringify(lastUnavailableDate)));
    groundIds.forEach(groundId => {
      allAsyncPromises.push(this.ngFire.collection('groundsPvt').doc(groundId).update({ availableDate: lastAvailableDate }));
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
  updateSeason(sid: string) {
    if (!sid) {
      return;
    }
    return this.ngFire.collection('seasons').doc(sid).update({
      isFixturesCreated: true
    })

  }
  calculateTotalTournamentMatches(teams: number): number {
    return this.calculateTotalLeagueMatches(teams) + this.calculateTotalKnockoutMatches(teams);
  }
  private getMID(type: 'FKC' | 'FPL' | 'FCP', index) {
    switch (type) {
      case 'FKC': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FKC}-${index}`;
      case 'FPL': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FPL}-${index}`;
      case 'FCP': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FCP}-${index}`;
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
  constructor(private ngFire: AngularFirestore) { }
}
