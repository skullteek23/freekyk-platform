import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ExitDashboardComponent } from '../components/exit-dashboard/exit-dashboard.component';

@Injectable({
  providedIn: 'root',
})
export class ExitDashGuard implements CanDeactivate<unknown> {
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (localStorage.getItem('uid') == null) return true;
    return this.getResponse();
  }
  async getResponse() {
    return this.dialog.open(ExitDashboardComponent).afterClosed().toPromise();
  }
  constructor(private dialog: MatDialog) {}
}
