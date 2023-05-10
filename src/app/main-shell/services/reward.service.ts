import { Injectable } from '@angular/core';
import { IPointsLog, LogType } from '@shared/interfaces/reward.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ILogListItem } from '../components/point-transaction-logs-dialog/point-transaction-logs-dialog.component';
import { ArraySorting } from '@shared/utils/array-sorting';

@Injectable({
  providedIn: 'root'
})
export class RewardService {

  private points = new BehaviorSubject<number>(null);
  private loading = new Subject<boolean>();

  constructor() { }

  _points(): Observable<number> {
    return this.points.asObservable();
  }

  _loading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  setPoints(data: number) {
    this.points.next(data);
  }

  showLoader() {
    this.loading.next(true);
  }

  hideLoader() {
    this.loading.next(false);
  }

  parseLogs(response: IPointsLog[]): ILogListItem[] {
    if (!response) {
      return [];
    }
    const list: ILogListItem[] = [];
    response.forEach(log => {
      const item: ILogListItem = {
        points: log.points,
        details: this.getDetails(log),
        timestamp: log.timestamp,
        class: log.type === LogType.debit ? 'debit' : 'credit'
      }
      list.push(item);
    });
    return list.sort(ArraySorting.sortObjectByKey('timestamp', 'desc'));
  }

  getDetails(value: IPointsLog): string {
    if (value) {
      const start = value.type === LogType.credit ? 'Received by' : 'Used for';
      return `${start} ${value.entity}`;
    }
  }
}
