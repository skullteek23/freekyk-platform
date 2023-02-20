import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { QueryService } from 'src/app/services/query.service';
import { TeamsFilters } from '@shared/Constants/FILTERS';
import { FilterData } from '@shared/interfaces/others.model';
import { TeamBasicInfo } from '@shared/interfaces/team.model';
import { ApiService } from '@shared/services/api.service';
import { manipulateTeamData } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-pl-teams',
  templateUrl: './pl-teams.component.html',
  styleUrls: ['./pl-teams.component.scss'],
})
export class PlTeamsComponent implements OnInit, OnDestroy {
  filterTerm: string = null;
  isLoading = true;
  noTeams = false;
  onMobile = false;
  teams$: Observable<TeamBasicInfo[]>;
  filterData: FilterData;
  cols = 1;
  subscriptions = new Subscription();

  constructor(
    private apiService: ApiService,
    private mediaObs: MediaObserver,
    private queryService: QueryService
  ) { }

  ngOnInit(): void {
    this.filterData = {
      defaultFilterPath: 'teams',
      filtersObj: TeamsFilters,
    };
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.onMobile = true;
          } else if (change.mqAlias === 'md') {
            this.onMobile = false;
            this.cols = 3;
          } else {
            this.onMobile = false;
            this.cols = 4;
          }
        })
    );
    this.getTeams();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTeams(): void {
    this.teams$ = this.apiService.getTeams().pipe(
      tap((val) => {
        this.noTeams = val.length === 0;
        this.isLoading = false;
      }),
    );
  }

  onQueryData(queryInfo): void {
    if (queryInfo === null) {
      return this.getTeams();
    }
    this.teams$ = this.queryService
      .onQueryData(queryInfo, 'teams')
      .pipe(
        manipulateTeamData.bind(this)
      );
  }
}
