import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { MockDataService } from './services/mock-data.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'football-platform-v1';
  menuOpen = false;
  dashOpen = false;
  routeSubscription: Subscription = new Subscription();
  constructor(private router: Router, private mockData: MockDataService) {}
  ngOnInit(): any {
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

  onOpenMenu(eventValue: any): any {
    this.menuOpen = eventValue;
  }
  ngOnDestroy(): any {
    this.routeSubscription.unsubscribe();
    localStorage.removeItem('uid');
  }
}
