import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupportTicketService {

  private onListChange = new Subject<boolean>();

  constructor() { }

  updateList() {
    this.onListChange.next(true);
  }

  _onListChange(): Observable<boolean> {
    return this.onListChange.asObservable();
  }
}
