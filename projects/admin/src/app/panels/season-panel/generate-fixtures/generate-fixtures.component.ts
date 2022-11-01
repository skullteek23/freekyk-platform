import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { dummyFixture } from 'src/app/shared/interfaces/match.model';
import { fixtureGenerationData } from 'src/app/shared/interfaces/others.model';
import { DUMMY_FIXTURE_TABLE_COLUMNS, MatchConstants } from '../../shared/constants/constants';
import { SeasonAdminService } from '../season-admin.service';

@Component({
  selector: 'app-generate-fixtures',
  templateUrl: './generate-fixtures.component.html',
  styleUrls: ['./generate-fixtures.component.css']
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
  lines = [];
  fixturesForm = new FormGroup({});
  fixturesList: dummyFixture[] = [];

  @Input() set data(value: any) {
    if (!value || !value.hasOwnProperty('season') || !value.hasOwnProperty('grounds')) {
      return;
    }
    const seasonInfo = value.season;
    const teams = seasonInfo ? seasonInfo.participatingTeamsCount : null;
    const tournaments = seasonInfo ? this.getTournaments(teams, seasonInfo.containingTournaments) : null;
    const startDate = seasonInfo ? new Date(seasonInfo.startDate) : null;
    const groundNamesArray: string[] = value.grounds.map(ground => ground.name);
    const groundNamesString: string = groundNamesArray.length ? groundNamesArray.join(', ') : 'NA';
    const data: fixtureGenerationData = {
      sName: seasonInfo?.name,
      grounds: value?.grounds,
      teamParticipating: seasonInfo?.participatingTeamsCount,
      matches: tournaments?.value,
      startDate: new Date(seasonInfo?.startDate).getTime(),
      oneMatchDur: MatchConstants.ONE_MATCH_DURATION,
    };
    if (tournaments && startDate && teams) {
      this.fixturesList = this.seasonAdminService.onGenerateDummyFixtures(data);
      const endDate = this.fixturesList && this.fixturesList.length ? this.fixturesList[this.fixturesList.length - 1].date : '';
      this.lines = [
        {
          heading: 'Teams Participating',
          content: teams
        },
        {
          heading: 'Tournaments to be held',
          content: tournaments?.viewValue
        },
        {
          heading: 'Start Date',
          content: startDate
        },
        {
          heading: 'Selected Grounds',
          content: groundNamesString
        },
        {
          heading: 'End Date (Approx)',
          content: endDate
        },
      ];
    } else {
      this.lines = [];
      this.fixturesList = [];
    }
    this.initForm(this.fixturesList);
  }

  constructor(private seasonAdminService: SeasonAdminService) { }

  ngOnInit(): void { }

  initForm(value: any[]): void {
    this.fixturesForm = new FormGroup({
      fixtures: new FormControl(value, [Validators.required])
    });
  }

  getTournaments(participatingTeams: number, containingTournaments: string[]): { viewValue: string; value: any } {
    let fkc = 0;
    let fcp = 0;
    let fpl = 0;
    if (containingTournaments.includes('FCP')) {
      fcp = participatingTeams === 2 ? 1 : participatingTeams / 2;
    }
    if (containingTournaments.includes('FKC') && participatingTeams % 4 === 0) {
      fkc = 1;
    }
    if (containingTournaments.includes('FPL') && participatingTeams > 2) {
      fpl = 1;
    }
    const tournaments = {
      viewValue: `${fcp} FCP, ${fkc} FKC and ${fpl} FPL`,
      value: { fcp, fkc, fpl }
    };
    return tournaments;
  }
}
