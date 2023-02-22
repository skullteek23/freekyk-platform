import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingStatusChange = new Subject<boolean>();

  constructor() { }

  showLoader() {
    this.loadingStatusChange.next(true);
  }

  hideLoader() {
    this.loadingStatusChange.next(true);
  }

  get _loadingStatusChange() {
    return this.loadingStatusChange;
  }
}
