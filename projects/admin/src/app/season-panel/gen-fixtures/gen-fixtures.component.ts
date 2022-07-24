import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { GenFixtService } from './gen-fixt.service';

@Component({
  selector: 'app-gen-fixtures',
  templateUrl: './gen-fixtures.component.html',
  styleUrls: ['./gen-fixtures.component.css'],
  providers: [GenFixtService],
})
export class GenFixturesComponent implements OnInit, OnDestroy, AfterViewInit {
  dummyFormGroup: FormGroup = new FormGroup({});
  isLoading = false;
  newSeasonId: string = null;
  seasonData: SeasonBasicInfo;
  grInfo$: Observable<GroundPrivateInfo[]>;
  groundsForm: FormGroup = new FormGroup({});
  @ViewChild('stepper') Stepper: MatStepper;
  seasonName = '';
  // sub: Subscription;
  // data: { pCount: number; stDate: Date; tmt: 'FKC' | 'FCP' | 'FPL' };
  constructor(private genServ: GenFixtService, private route: ActivatedRoute,
    private ngFire: AngularFirestore,) {

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
        this.getGrounds(this.seasonData.locState, this.seasonData.locCity);
      }))
    }
    // this.sub = genServ.stepChange.subscribe((response) => {
    //   response ? this.Stepper.next() : this.Stepper.previous();
    // });
  }
  getGrounds(state: string, city: string) {
    this.grInfo$ = this.ngFire
      .collection('groundsPvt', (query) =>
        query.where('locState', '==', state).where('locCity', '==', city)
      )
      .get()
      .pipe(
        map((resp) => resp.docs.map((doc) => <GroundPrivateInfo>doc.data()))
      );
  }

  getAvDays(timings: {}) {
    const availDays: string[] = [];
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++)
      if (timings.hasOwnProperty(i)) availDays.push(days[i]);
    return availDays.join(', ');
  }
  ngOnDestroy(): void {
    // this.sub.unsubscribe();
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.Stepper.next();
  }
}
