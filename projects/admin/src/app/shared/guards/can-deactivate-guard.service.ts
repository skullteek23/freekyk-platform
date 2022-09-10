import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export type Guard = Observable<boolean> | Promise<boolean> | boolean;

export interface canComponentDeactivate {
  canDeactivate: () => Guard;
}

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuardService implements CanDeactivate<canComponentDeactivate> {

  constructor() { }

  canDeactivate(component: canComponentDeactivate): Guard {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
