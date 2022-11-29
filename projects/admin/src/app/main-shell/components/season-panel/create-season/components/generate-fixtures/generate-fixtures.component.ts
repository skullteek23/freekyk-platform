import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DUMMY_FIXTURE_TABLE_COLUMNS } from '@shared/constants/constants';
import { IDummyFixture } from '@shared/interfaces/match.model';
import { ISelectMatchType, ISelectGrounds, ISeasonDetails, IDummyFixtureOptions } from '@shared/interfaces/season.model';
import { SeasonAdminService } from '../../../../../services/season-admin.service';

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
      options.fcpMatches = selectMatchTypeFormData.containingTournaments.includes('FCP')
        ? this.seasonAdminService.calculateTotalCPMatches(selectMatchTypeFormData.participatingTeamsCount)
        : 0;
      options.fkcMatches = selectMatchTypeFormData.containingTournaments.includes('FKC')
        ? this.seasonAdminService.calculateTotalKnockoutMatches(selectMatchTypeFormData.participatingTeamsCount)
        : 0;
      options.fplMatches = selectMatchTypeFormData.containingTournaments.includes('FPL')
        ? this.seasonAdminService.calculateTotalLeagueMatches(selectMatchTypeFormData.participatingTeamsCount)
        : 0;
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
