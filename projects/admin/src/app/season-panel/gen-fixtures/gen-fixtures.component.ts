import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { SeasonAbout, SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { MatListOption } from '@angular/material/list';
import { GenFixtService } from './gen-fixt.service';
import { CloudFunctionFixtureData } from 'src/app/shared/interfaces/others.model';
import { MatchConstants } from '../../shared/constants/constants';
import { dummyFixture, MatchFixture } from 'src/app/shared/interfaces/match.model';
import { FormGroup } from '@angular/forms';

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
  seasonData: SeasonBasicInfo;
  formData: any = {};
  seasonMoreData: SeasonAbout;
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
        this.seasonData = response[0].data() as SeasonBasicInfo;
        this.seasonData = {
          ...this.seasonData,
          start_date: new Date(this.seasonData.start_date['seconds'] * 1000)
        }
        this.seasonMoreData = response[1].data() as SeasonAbout;
        this.formData = {
          ...this.seasonData,
          ...this.seasonMoreData
        }
        this.isLoading = false;
      }))
    }
  }

  ngOnDestroy(): void { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.stepper) {
      this.stepper.selectionChange.subscribe(change => {
        if (change.selectedIndex === 1 && this.seasonData) {
          this.getGrounds();
          this.calculateTournaments(this.seasonData.p_teams, this.seasonData.cont_tour);
        }
      })
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
        query.where('locState', '==', this.seasonData.locState).where('locCity', '==', this.seasonData.locCity).where('contractStartDate', '<', this.seasonData.start_date)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => <GroundPrivateInfo>doc.data())),
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
    this.tableData = this.genFixtService.onGenerateDummyFixtures(data);
    this.isLoading = false;
  }
  onSaveFixtures() {
    this.isLoading = true;
    const fixtures: MatchFixture[] = this.genFixtService.parseDummyFixtures(this.tableData);
    let allPromises = [];
    allPromises.push(this.genFixtService.onCreateFixtures(fixtures));
    allPromises.push(this.genFixtService.updateSeason(this.newSeasonId));
    Promise.all(allPromises).then(() => {
      this.isLoading = false;
      this.stepper.next();
    })
  }
  goToURL() {
    window.open(`https://freekyk-prod.web.app/s/${this.seasonName}`, "_blank");
  }
}
