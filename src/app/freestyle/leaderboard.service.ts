import { Injectable } from '@angular/core';
import { fsLeaderboardModel } from '../shared/interfaces/others.model';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  leaderboardData: fsLeaderboardModel[] = [];
  constructor() {
    for (let i = 1; i <= 20; i++) {
      this.leaderboardData.push({
        rank: i,
        freestyler: {
          imgpath:
            'https://images.unsplash.com/photo-1613661837219-24de18e74275?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
          name: 'Freestyler' + i,
          nickname: 'Alex',
          locCountry: 'India',
        },
        pts: 400 - i,
      });
    }
  }
  ngOnInit() {}
  getFsData() {
    return this.leaderboardData.slice();
  }
  getTop10FsData() {
    return this.leaderboardData.slice(0, 10);
  }
}
