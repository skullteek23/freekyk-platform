import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ILink } from '@shared/Constants/ROUTE_LINKS';
import { Subscription } from 'rxjs';
import { GenerateRewardService } from './main-shell/services/generate-reward.service';

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
    { name: 'Account', route: '/account', icon: 'person' },
  ]

  title = 'football-platform-v1';
  menuOpen = false;
  isOnboarding = false;
  subscriptions = new Subscription();

  constructor(
    private router: Router,
    private generateRewardService: GenerateRewardService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.isOnboarding = event.url.includes('onboarding');
      }
    }));
  }

  onOpenMenu(eventValue: any): any {
    this.menuOpen = eventValue;
  }

  ngOnDestroy(): any {
    localStorage.removeItem('uid');
    this.subscriptions.unsubscribe();
  }

}
