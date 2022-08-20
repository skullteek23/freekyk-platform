import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GroundBasicInfo, GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { SeasonAbout, SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { MatListOption } from '@angular/material/list';
import { GenFixtService } from './gen-fixt.service';
import { CloudFunctionFixtureData } from 'src/app/shared/interfaces/others.model';
import { MatchConstants, SEASON_PROD_URL } from '../../shared/constants/constants';
import { dummyFixture, MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FormGroup } from '@angular/forms';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';

@Component({
  selector: 'app-gen-fixtures',
  templateUrl: './gen-fixtures.component.html',
  styleUrls: ['./gen-fixtures.component.css']
})
export class GenFixturesComponent implements OnInit, OnDestroy, AfterViewInit {

  dummyFixtures: dummyFixture[] = [];
  grInfo$: Observable<GroundPrivateInfo[]>;
  isLoading = false;
  matches: { fkc: number, fcp: number, fpl: number } = {
    fkc: 0,
    fcp: 0,
    fpl: 0,
  };
  newSeasonId: string = null;
  formData: any = {};
  seasonName = '';
  seasonForm = new FormGroup({});
  selectedGroundsList: GroundPrivateInfo[] = []
  tableData: dummyFixture[] = [];

  @ViewChild('stepper') stepper: MatStepper;

  constructor(private route: ActivatedRoute, private ngFire: AngularFirestore, private genFixtService: GenFixtService) {
    const params = this.route.snapshot.params;
    const qParams = this.route.snapshot.queryParams;
    if (qParams && qParams.hasOwnProperty('name')) {
      this.seasonName = qParams.name;
    }
    if (params.hasOwnProperty('sid') && window.location.href.includes('season') && params.sid) {
      this.isLoading = true;
      this.newSeasonId = params.sid;
      forkJoin([ngFire.collection('seasons').doc(this.newSeasonId).get(), ngFire.collection(`seasons/${this.newSeasonId}/additionalInfo`).doc('moreInfo').get()]).subscribe((response => {
        let seasonData = response[0].data() as SeasonBasicInfo;
        seasonData = {
          ...seasonData,
          start_date: new Date(seasonData.start_date['seconds'] * 1000)
        }
        let seasonMoreData = response[1].data() as SeasonAbout;
        this.formData = {
          ...seasonData,
          ...seasonMoreData
        }
        this.isLoading = false;
      }))
    }
  }

  ngOnDestroy(): void { }

  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  onChangeStep(ev: StepperSelectionEvent) {
    if (ev.selectedIndex === 1 && this.formData) {
      this.getGrounds();
      this.calculateTournaments(this.formData.p_teams, this.formData.cont_tour);
    }
  }

  onSetSeasonData(data: any) {
    if (data) {
      this.formData = { ...data };
    }
    if (!this.formData.isFixturesCreated) {
      this.stepper.next();
    }
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
    this.isLoading = true;
    this.grInfo$ = this.ngFire
      .collection('groundsPvt', (query) =>
        query.where('locState', '==', this.formData.locState).where('locCity', '==', this.formData.locCity).where('contractStartDate', '<', this.formData.start_date)
      )
      .snapshotChanges()
      .pipe(
        map(resp => resp.map(re => {
          return {
            ...re.payload.doc.data() as GroundPrivateInfo,
            id: re.payload.doc.id
          } as GroundPrivateInfo
        })),
        tap(() => {
          this.isLoading = false;
        })
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
    this.selectedGroundsList = selection.map(sel => (sel.value as GroundPrivateInfo)).sort(ArraySorting.sortObjectByKey('name'));
  }

  get selectedGroundsString() {
    return this.selectedGroundsList.map(sel => sel.name).sort().join(', ');
  }
  onGenerateFixtures() {
    this.isLoading = true;
    const data: CloudFunctionFixtureData = {
      sName: this.seasonName || this.formData.name,
      sid: this.newSeasonId || this.formData.id,
      grounds: this.selectedGroundsList,
      teamParticipating: this.formData.p_teams,
      matches: this.matches,
      startDate: new Date(this.formData.start_date),
      oneMatchDur: MatchConstants.ONE_MATCH_DURATION,
      tour_type: this.formData.cont_tour
    }
    this.tableData = this.genFixtService.onGenerateDummyFixtures(data);
    const UniqueGroundMap = new Map<string, string>();
    this.tableData.forEach(value => UniqueGroundMap.set(value.stadium, value.stadium));
    const tempGrounds: string[] = [...UniqueGroundMap.values()];
    const usedGrounds = [];
    const selectedGroundsListCopy = [];
    this.selectedGroundsList.forEach(element => {
      selectedGroundsListCopy.push(element.name);
      if (tempGrounds.includes(element.name)) {
        usedGrounds.push(element);
      }
    });
    if (JSON.parse(JSON.stringify(selectedGroundsListCopy.sort())) !== JSON.parse(JSON.stringify(usedGrounds.sort()))) {
      this.selectedGroundsList = usedGrounds.sort();
    }
    this.isLoading = false;
  }
  onSaveFixtures() {
    this.isLoading = true;
    const fixtures: MatchFixture[] = this.genFixtService.getPublishableFixture(this.tableData);
    const lastFixture: MatchFixture = fixtures[fixtures.length - 1];
    const seasonID = this.newSeasonId ? this.newSeasonId : this.formData['id'];
    const unavailableStartDate = new Date(lastFixture.date['seconds'] * 1000);
    const unavailableEndDate = this.formData['start_date'];
    let allPromises = [];
    if (seasonID && this.selectedGroundsList.length && fixtures.length && unavailableStartDate && unavailableEndDate) {
      allPromises.push(this.genFixtService.onCreateFixtures(fixtures));
      allPromises.push(this.genFixtService.updateSeason(seasonID));
      allPromises.push(this.genFixtService.updateGroundAvailability(this.selectedGroundsList.map(gr => gr.id), unavailableStartDate, unavailableEndDate));
      Promise.all(allPromises).then(() => {
        this.isLoading = false;
        this.stepper.next();
      });
    }
  }
  goToURL() {
    window.open(`${SEASON_PROD_URL}${this.seasonName}`, "_blank");
  }

  isGroundDisabled(ground: GroundPrivateInfo): boolean {
    const contractStartDate = ground['contractStartDate'] ? ground['contractStartDate'].toMillis() : null;
    const contractEndDate = ground['contractEndDate'] ? ground['contractEndDate'].toMillis() : null;
    const unavailableStartDate = ground['unavailableStartDate'] ? ground['unavailableStartDate'].toMillis() : null;
    const unavailableEndDate = ground['unavailableEndDate'] ? ground['unavailableEndDate'].toMillis() : null;
    const seasonStartDate = new Date(this.formData['start_date']).getTime();
    if (!unavailableStartDate || !unavailableEndDate) {
      return false;
    }
    if (seasonStartDate && unavailableStartDate && unavailableEndDate && seasonStartDate > unavailableStartDate && seasonStartDate < unavailableEndDate) {
      return true;
    } else if (seasonStartDate && (seasonStartDate > contractEndDate || seasonStartDate < contractStartDate)) {
      return true;
    } else if (seasonStartDate && unavailableStartDate && unavailableEndDate && (seasonStartDate < unavailableStartDate || seasonStartDate > unavailableEndDate)) {
      return false;
    }
    return true;
  }

  get totalMatches(): number {
    return (this.matches.fcp + this.genFixtService.calculateTotalTournamentMatches(this.formData.p_teams));
  }
}
