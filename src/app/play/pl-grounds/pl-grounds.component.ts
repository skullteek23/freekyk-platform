import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { ApiService } from '@shared/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pl-grounds',
  templateUrl: './pl-grounds.component.html',
  styleUrls: ['./pl-grounds.component.scss'],
})
export class PlGroundsComponent implements OnInit, OnDestroy {

  subscriptions = new Subscription();
  isLoaderShown = false;
  grounds: GroundBasicInfo[] = [];
  groundsCache: GroundBasicInfo[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getGrounds();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getGrounds(): void {
    this.isLoaderShown = true;
    this.apiService.getGrounds()
      .subscribe({
        next: (response) => {
          if (response) {
            this.grounds = response;
            this.groundsCache = JSON.parse(JSON.stringify(response));
          }
          this.isLoaderShown = false;
          window.scrollTo(0, 0);
        },
        error: () => {
          this.grounds = [];
          this.groundsCache = [];
          window.scrollTo(0, 0);
          this.isLoaderShown = false;
        }
      })
  }

  applyFilter(searchValue: string) {
    if (searchValue) {
      const value = searchValue.trim().toLowerCase();
      this.grounds = this.groundsCache.filter(ground => ground.name.trim().toLowerCase().includes(value));
    } else {
      this.grounds = JSON.parse(JSON.stringify(this.groundsCache));
    }
  }

  openGround(ground: GroundBasicInfo) {
    if (ground?.id) {
      this.router.navigate(['/ground', ground.id]);
    }
  }
}
