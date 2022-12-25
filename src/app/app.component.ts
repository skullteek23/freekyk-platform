import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'football-platform-v1';
  menuOpen = false;
  dashOpen = false;
  routeSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.dashOpen = event.url.includes('dashboard');
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
