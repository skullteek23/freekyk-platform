import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css'],
})
export class PlayComponent implements OnInit, OnDestroy {
  playLinks: string[] = [
    'home',
    'seasons',
    'players',
    'teams',
    'fixtures',
    'results',
    'standings',
    'grounds',
  ];
  routeSubscription: Subscription;
  activeLink: string = '';
  constructor(private router: Router) {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url.slice('/play/'.length);
      }
    });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
