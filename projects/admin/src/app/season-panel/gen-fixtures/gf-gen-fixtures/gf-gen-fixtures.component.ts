import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  MatchFixture,
  MatchFixtureOverview,
  MatchLineup,
  tempFullFixtureData,
} from 'src/app/shared/interfaces/match.model';
import { GenFixtService } from '../gen-fixt.service';

@Component({
  selector: 'app-gf-gen-fixtures',
  templateUrl: './gf-gen-fixtures.component.html',
  styleUrls: ['./gf-gen-fixtures.component.css'],
})
export class GfGenFixturesComponent implements OnInit {
  totMatches: number = 0;
  totParticipants: number = 0;
  Fixtures$: Observable<MatchFixture[]>;
  fixtures: MatchFixture[] = [];
  addiInfos: MatchFixtureOverview[] = [];
  lineups: MatchLineup[] = [];
  isLoading: boolean = true;
  tourType: string = 'FPL';
  constructor(
    private genServ: GenFixtService,
    private snackServ: SnackbarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.Fixtures$ = this.genServ
      .onGenFixtures()
      .pipe(tap((resp) => (this.isLoading = false)));
    this.totParticipants = this.genServ.getTourData().participantCount;
    this.tourType = this.genServ.getTourData().tour_type;

    this.totMatches = this.genServ.getTotalMatches(
      this.tourType == 'FKC' ? true : false
    );
  }
  getTour() {
    switch (this.tourType) {
      case 'FKC':
        return 'Freekyk Knockout Championship';
      case 'FPL':
        return 'Freekyk Premier League';
      case 'FCP':
        return 'Freekyk Community Play';
      default:
        return 'Unknown';
    }
  }
  getStartDate() {
    return this.genServ.getTourData().startDate;
  }
  onUpdate(data: tempFullFixtureData) {
    console.log(data);
    this.fixtures.push(data.fixture);
    this.addiInfos.push(data.overview);
    this.lineups.push(data.lineup);
  }
  onPrevious() {
    this.genServ.onPreviousStep();
  }
  onNext() {
    this.genServ
      .onCreateFixtures(this.fixtures, this.addiInfos, this.lineups)
      .then(() => {
        this.snackServ.displayCustomMsg('Fixtures generated successfully!');
        this.router.navigate(['/admin/home']);
      });
  }
}
