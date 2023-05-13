import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroundBasicInfo } from '@shared/interfaces/ground.model';
import { ApiGetService } from '@shared/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-find-grounds',
  templateUrl: './find-grounds.component.html',
  styleUrls: ['./find-grounds.component.scss']
})
export class FindGroundsComponent implements OnInit {

  subscriptions = new Subscription();
  isLoaderShown = false;
  grounds: GroundBasicInfo[] = [];
  groundsCache: GroundBasicInfo[] = [];

  constructor(
    private apiService: ApiGetService,
    private router: Router
  ) { }

  ngOnInit(): void {
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
