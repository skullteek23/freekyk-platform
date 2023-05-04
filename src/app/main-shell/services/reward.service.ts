import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
}
