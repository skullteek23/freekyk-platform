import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILink } from '@shared/Constants/ROUTE_LINKS';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  readonly links: ILink[] = [
    { name: 'Home', route: '/', icon: 'home' },
    { name: 'My Matches', route: '/my-matches', icon: 'sports_soccer' },
    { name: 'My Team', route: '/my-team', icon: 'groups' },
    { name: 'Profile', route: '/profile', icon: 'manage_accounts' },
  ]

  title = 'football-platform-v1';
  menuOpen = false;
  dashOpen = false;

  constructor() { }

  ngOnInit(): void { }

  onOpenMenu(eventValue: any): any {
    this.menuOpen = eventValue;
  }

  ngOnDestroy(): any {
    localStorage.removeItem('uid');
  }

}
