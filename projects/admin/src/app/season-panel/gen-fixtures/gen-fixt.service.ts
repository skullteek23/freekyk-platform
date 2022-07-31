import { Injectable } from '@angular/core';
import { dummyFixture, MatchFixture, MatchFixtureOverview, MatchLineup } from 'src/app/shared/interfaces/match.model';
import { CloudFunctionFixtureData } from 'src/app/shared/interfaces/others.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})

export class GenFixtService {
  onGenerateDummyFixtures(data: CloudFunctionFixtureData) {
    const fixtures: dummyFixture[] = [];
    let fcpMatches = data.matches.fcp;
    let fkcMatches = this.calculateTotalKnockoutMatches(data.matches.fkc ? data.teamParticipating : 0);
    let fplMatches = this.calculateTotalLeagueMatches(data.matches.fpl ? data.teamParticipating : 0);
    const totalMatches: number = fcpMatches + fkcMatches + fplMatches;
    const grounds = data.grounds;
    const datesAvailable: { date: Date, groundName: string, locCity: string, locState: string }[] = [];
    let initialDate = new Date(data.startDate);
    while (datesAvailable.length < totalMatches) {
      const day = initialDate.getDay();
      for (let k = 0; k < grounds.length; k++) {
        const grTimings = grounds[k].timings;
        const groundName = grounds[k].name;
        const locCity = grounds[k].locCity;
        const locState = grounds[k].locState;
        if (grTimings.hasOwnProperty(day)) {
          const grTimingsByDay = grTimings[day] as number[];
          for (let i = 0; i < grTimingsByDay.length; i++) {
            if (!datesAvailable.length) {
              const date = new Date(JSON.parse(JSON.stringify(initialDate)));
              date.setHours(grTimingsByDay[i]);
              datesAvailable.push({ date, groundName, locCity, locState });
              continue;
            }
            const currentHour = grTimingsByDay[i];
            const lastDateHour = datesAvailable[datesAvailable.length - 1].date.getHours();
            const currentDay = day;
            const lastDateDay = datesAvailable[datesAvailable.length - 1].date.getDay();
            const currentGround = groundName;
            const lastGround = datesAvailable[datesAvailable.length - 1].groundName;
            if (this.getDifference(currentHour, lastDateHour) >= data.oneMatchDur && currentDay === lastDateDay ||
              this.getDifference(currentHour, lastDateHour) <= data.oneMatchDur && currentDay !== lastDateDay ||
              this.getDifference(currentHour, lastDateHour) <= data.oneMatchDur && currentDay === lastDateDay && lastGround !== currentGround) {
              const date = new Date(JSON.parse(JSON.stringify(initialDate)));
              date.setHours(grTimingsByDay[i]);
              datesAvailable.push({ date, groundName, locCity, locState });
            }
          }
        }
      };
      initialDate.setDate(initialDate.getDate() + 1);
    }
    for (let index = 0; index < totalMatches; index++) {
      let matchType: 'FKC' | 'FCP' | 'FPL' = 'FCP';
      if (fkcMatches && index >= fcpMatches) {
        matchType = 'FKC';
      } else if (fplMatches && index >= (fcpMatches + fkcMatches)) {
        matchType = 'FPL';
      }
      fixtures.push({
        date: datesAvailable[index].date,
        concluded: false,
        premium: true,
        season: data.sName,
        type: matchType,
        locCity: datesAvailable[index].locCity,
        locState: datesAvailable[index].locState,
        stadium: datesAvailable[index].groundName,
      });
    }
    return (fixtures);
  }
  onCreateFixtures(
    fixtures: MatchFixture[],
    overviews: MatchFixtureOverview[],
    lineups: MatchLineup[]
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
  private calculateTotalLeagueMatches(teams: number): number {
    return !teams ? 0 : (teams * (teams - 1)) / 2;
  }
  private calculateTotalKnockoutMatches(teams: number): number {
    return !teams ? 0 : teams / 2;
  }
  private getDifference(a: number, b: number): number {
    return a - b;
  }
  constructor(private ngFire: AngularFirestore) { }
}
