import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { Observable, } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { MatListOption } from '@angular/material/list';
import { GenFixtService } from './gen-fixt.service';
import { CloudFunctionFixtureData } from 'src/app/shared/interfaces/others.model';
import { DUMMY_FIXTURE_TABLE_COLUMNS, DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS, MatchConstants } from '../../shared/constants/constants';
import { dummyFixture } from 'src/app/shared/interfaces/match.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-gen-fixtures',
  templateUrl: './gen-fixtures.component.html',
  styleUrls: ['./gen-fixtures.component.css']
})
export class GenFixturesComponent implements OnInit, OnDestroy, AfterViewInit {

  readonly TABLE_UI_COLUMNS = DUMMY_FIXTURE_TABLE_DISPLAY_COLUMNS;
  readonly TABLE_COLUMNS = DUMMY_FIXTURE_TABLE_COLUMNS;
  readonly TBD = 'TBD';

  displayedColumns = [
    DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID,
    DUMMY_FIXTURE_TABLE_COLUMNS.HOME,
    DUMMY_FIXTURE_TABLE_COLUMNS.AWAY,
    DUMMY_FIXTURE_TABLE_COLUMNS.DATE,
    DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION,
    DUMMY_FIXTURE_TABLE_COLUMNS.GROUND,
  ]
  dummyFixtures: dummyFixture[] = [];
  fixtureDataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  grInfo$: Observable<GroundPrivateInfo[]>;
  isLoading = false;
  matches: { fkc: number, fcp: number, fpl: number } = {
    fkc: 0,
    fcp: 0,
    fpl: 0,
  };
  newSeasonId: string = null;
  seasonData: SeasonBasicInfo;
  seasonName = '';
  selectedGroundsList: GroundPrivateInfo[] = []

  @ViewChild('stepper') Stepper: MatStepper;

  constructor(private route: ActivatedRoute, private ngFire: AngularFirestore, private genFixtService: GenFixtService) {
    const params = this.route.snapshot.params;
    const qParams = this.route.snapshot.queryParams;
    if (qParams && qParams.hasOwnProperty('name')) {
      this.seasonName = qParams.name;
    }
    if (params.hasOwnProperty('sid') && window.location.href.includes('fixtures') && params.sid) {
      this.isLoading = true;
      this.newSeasonId = params.sid;
      this.ngFire.collection('seasons').doc(this.newSeasonId).get().subscribe((response => {
        this.seasonData = response.data() as SeasonBasicInfo;
        this.seasonData = {
          ...this.seasonData,
          start_date: new Date(this.seasonData.start_date['seconds'] * 1000)
        }
        this.isLoading = false;
        this.calculateTournaments(this.seasonData.p_teams, this.seasonData.cont_tour);
        this.getGrounds();
      }))
    }
  }

  ngOnDestroy(): void { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.Stepper.next();
  }

  calculateTournaments(participatingTeams: number, containingTournaments: string[]) {
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
    this.matches = { fkc, fcp, fpl };
  }

  getGrounds() {
    this.grInfo$ = this.ngFire
      .collection('groundsPvt', (query) =>
        query.where('locState', '==', this.seasonData.locState).where('locCity', '==', this.seasonData.locCity).where('contractStartDate', '<', this.seasonData.start_date)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => <GroundPrivateInfo>doc.data()))
      );
  }

  getAvailableDays(timings: {}) {
    const availDays: string[] = [];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (timings.hasOwnProperty(i)) {
        availDays.push(days[i]);
      }
    }
    const lastElement = availDays.splice(availDays.length - 1, 1)
    return availDays.slice().join(', ').concat(' & ').concat(lastElement[0]);
  }

  onSaveGrounds(selection: MatListOption[]) {
    this.selectedGroundsList = selection.map(sel => (sel.value as GroundPrivateInfo));
  }

  get selectedGrounds() {
    return this.selectedGroundsList.map(sel => sel.name).join(', ');
  }
  onGenerateFixtures() {
    this.isLoading = true;
    const data: CloudFunctionFixtureData = {
      sName: this.seasonName || this.seasonData.name,
      sid: this.newSeasonId || this.seasonData.id,
      grounds: this.selectedGroundsList,
      teamParticipating: this.seasonData.p_teams,
      matches: this.matches,
      startDate: new Date(this.seasonData.start_date),
      oneMatchDur: MatchConstants.ONE_MATCH_DURATION,
      tour_type: this.seasonData.cont_tour
    }
    this.dummyFixtures = this.genFixtService.onGenerateDummyFixtures(data);
    const tableData = [];
    this.dummyFixtures.forEach((value, index) => {
      const count = index + 1;
      const data = {
        [DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID]: this.getMID(value.type, count),
        [DUMMY_FIXTURE_TABLE_COLUMNS.HOME]: this.TBD,
        [DUMMY_FIXTURE_TABLE_COLUMNS.AWAY]: this.TBD,
        [DUMMY_FIXTURE_TABLE_COLUMNS.DATE]: value.date,
        [DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION]: `${value.locCity}, ${value.locState}`,
        [DUMMY_FIXTURE_TABLE_COLUMNS.GROUND]: value.stadium,
      }
      tableData.push(data);
    }, this);
    this.fixtureDataSource = new MatTableDataSource(tableData);
    this.fixtureDataSource.sortingDataAccessor = (data, sortHeaderId) => {
      return data[sortHeaderId].toLowerCase();
    }
    this.isLoading = false;
  }
  getMID(type: 'FKC' | 'FPL' | 'FCP', index) {
    switch (type) {
      case 'FKC': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FKC}-${index}`;
      case 'FPL': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FPL}-${index}`;
      case 'FCP': return `${MatchConstants.UNIQUE_MATCH_TYPE_CODES.FCP}-${index}`;
    }
  }
  onSaveFixtures() { }
}
