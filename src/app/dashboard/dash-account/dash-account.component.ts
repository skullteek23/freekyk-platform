import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlayerService } from 'src/app/services/player.service';
import { TeamService } from 'src/app/services/team.service';
import { RouteLinks } from '@shared/Constants/ROUTE_LINKS';
@Component({
  selector: 'app-dash-account',
  templateUrl: './dash-account.component.html',
  styleUrls: ['./dash-account.component.scss'],
})
export class DashAccountComponent implements OnInit, OnDestroy {
  accountLinks: string[] = RouteLinks.DASHBOARD_ACCOUNT;
  routeSubscription: Subscription;
  activeLink = '';
  constructor(
    private router: Router,
    private plServ: PlayerService,
    private teServ: TeamService
  ) {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url.slice('/dashboard/account/'.length);
      }
    });
  }
  ngOnInit(): void { }
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
