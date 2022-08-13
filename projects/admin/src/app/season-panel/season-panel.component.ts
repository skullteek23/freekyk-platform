import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from "rxjs";
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-season-panel',
  templateUrl: './season-panel.component.html',
  styleUrls: ['./season-panel.component.css'],
})
export class SeasonPanelComponent implements OnDestroy {
  isShowButton = true;
  routeSubscription: Subscription;
  constructor(private router: Router) {
    this.routeSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      if (window.location.href.endsWith('seasons')) {
        this.isShowButton = true;
      } else {
        this.isShowButton = false;
      }
    });

  }
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
