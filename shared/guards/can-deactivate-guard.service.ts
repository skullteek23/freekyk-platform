import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export type Guard = Observable<boolean> | Promise<boolean> | boolean;

export interface CanComponentDeactivate {
  canDeactivate: () => Guard;
}

@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuardService implements CanDeactivate<CanComponentDeactivate> {

  constructor() { }

  canDeactivate(component: CanComponentDeactivate): Guard {
    return component.canDeactivate ? component.canDeactivate() : false;
  }
}
