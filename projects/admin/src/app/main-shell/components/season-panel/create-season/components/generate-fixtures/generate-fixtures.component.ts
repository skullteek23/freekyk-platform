import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DUMMY_FIXTURE_TABLE_COLUMNS } from '@shared/constants/constants';
import { IDummyFixture } from '@shared/interfaces/match.model';
import { IDummyFixtureOptions, SeasonAdminService } from '../../../season-admin.service';
import { ISeasonDetails, ISelectGrounds, ISelectMatchType } from '../../create-season.component';

@Component({
  selector: 'app-generate-fixtures',
  templateUrl: './generate-fixtures.component.html',
  styleUrls: ['./generate-fixtures.component.scss']
})
export class GenerateFixturesComponent implements OnInit {

  cols = [
    DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID,
    DUMMY_FIXTURE_TABLE_COLUMNS.HOME,
    DUMMY_FIXTURE_TABLE_COLUMNS.AWAY,
    DUMMY_FIXTURE_TABLE_COLUMNS.DATE,
    DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION,
    DUMMY_FIXTURE_TABLE_COLUMNS.GROUND,
  ];
  fixturesForm: FormGroup;
  fixturesList: IDummyFixture[] = [];

  constructor(private seasonAdminService: SeasonAdminService) { }

  ngOnInit(): void {
    this.initFixtures();
    this.initForm(this.fixturesList);
  }

  initFixtures() {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    const selectGroundFormData: ISelectGrounds = JSON.parse(sessionStorage.getItem('selectGround'));
    const seasonDetailsFormData: ISeasonDetails = JSON.parse(sessionStorage.getItem('seasonDetails'));
    const options: IDummyFixtureOptions = {};

    if (selectMatchTypeFormData && selectGroundFormData && seasonDetailsFormData) {
      options.grounds = selectGroundFormData;
      if (selectMatchTypeFormData.containingTournaments.includes('FCP')) {
        options.fcpMatches = selectMatchTypeFormData.participatingTeamsCount;
      }
      if (selectMatchTypeFormData.containingTournaments.includes('FKC')) {
        options.fkcMatches = this.seasonAdminService.calculateTotalKnockoutMatches(selectMatchTypeFormData.participatingTeamsCount);
      }
      if (selectMatchTypeFormData.containingTournaments.includes('FPL')) {
        options.fplMatches = this.seasonAdminService.calculateTotalLeagueMatches(selectMatchTypeFormData.participatingTeamsCount);
      }
      options.season = seasonDetailsFormData.name;
    }
    this.fixturesList = this.seasonAdminService.getDummyFixtures(options);
  }

  initForm(value: IDummyFixture[]): void {
    this.fixturesForm = new FormGroup({
      fixtures: new FormControl(value, [Validators.required])
    });
  }
}
