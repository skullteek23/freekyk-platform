import { Injectable } from '@angular/core';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ILeaderBoardTableData } from '../components/leaderboard/components/leaderboard-table/leaderboard-table.component';
import { ArraySorting } from '@shared/utils/array-sorting';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  private players = new BehaviorSubject<PlayerAllInfo[]>(null);
  private loading = new Subject<boolean>();

  constructor() { }

  _players(): Observable<PlayerAllInfo[]> {
    return this.players.asObservable();
  }

  _loading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  setPlayerList(data: PlayerAllInfo[]) {
    this.players.next(data);
  }

  parseStats(response: PlayerAllInfo[], statsKey: string): ILeaderBoardTableData[] {
    if (!response || !statsKey) {
      return [];
    }
    response.sort(ArraySorting.sortObjectByKey(statsKey));
    return response.map(el => ({
      name: el.name,
      imgpath: el.imgpath,
      id: el.id,
      statistic: el[statsKey]
    }));
  }

  showLoader() {
    this.loading.next(true);
  }

  hideLoader() {
    this.loading.next(false);
  }
}
