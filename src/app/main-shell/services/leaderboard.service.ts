import { Injectable } from '@angular/core';
import { PlayerAllInfo } from '@shared/utils/pipe-functions';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ILeaderBoardTableData } from '../components/leaderboard/components/leaderboard-table/leaderboard-table.component';

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

  parseStats(response: any[], statsKey: string): ILeaderBoardTableData[] {
    if (!response) {
      return [];
    }
    return response.map(el => ({
      name: el.name,
      imgpath: el.imgpath,
      id: el.id,
      statistic: Number(el[statsKey])
    }));
  }

  showLoader() {
    this.loading.next(true);
  }

  hideLoader() {
    this.loading.next(false);
  }
}
