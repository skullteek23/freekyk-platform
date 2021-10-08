import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  GroundBasicInfo,
  GroundMoreInfo,
  GroundPrivateInfo,
} from './shared/interfaces/ground.model';
import { SeasonParticipants } from './shared/interfaces/season.model';
import firebase from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'football-platform-v1';
  menuOpen = false;
  dashOpen = false;
  routeSubscription: Subscription = new Subscription();
  constructor(private router: Router, private ngFire: AngularFirestore) {}
  ngOnInit() {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        // Hide loading indicator
        this.dashOpen = [
          '/dashboard/home',
          '/dashboard/team-management',
          '/dashboard/freestyle',
          '/dashboard/premium',
          '/dashboard/account',
        ]
          .includes(event.url)
          .valueOf();
      }
    });
  }

  onOpenMenu(eventValue: any) {
    this.menuOpen = eventValue;
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();

    localStorage.removeItem('uid');
  }
}
