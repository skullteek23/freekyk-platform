import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { map, share } from 'rxjs/operators';
import { dummyFixture } from 'src/app/shared/interfaces/match.model';
import { SeasonAbout, SeasonBasicInfo, SeasonDraft, statusType } from 'src/app/shared/interfaces/season.model';
import { GenerateFixturesService } from '../generate-fixtures.service';
import firebase from 'firebase/app';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { MatchConstants } from '../../shared/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { CreateSeasonComponent } from '../create-season/create-season.component';
import { RequestDialogComponent } from '../request-dialog/request-dialog.component';
import { forkJoin, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundBookings, GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';

@Component({
  selector: 'app-view-season-draft',
  templateUrl: './view-season-draft.component.html',
  styleUrls: ['./view-season-draft.component.css']
})
export class ViewSeasonDraftComponent implements OnInit {

  isLoaderShown = false;
  seasonDraftData: SeasonDraft;
  finalFees = 0;
  seasonFixtures: dummyFixture[] = [];
  isSeasonPublished = false;

  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private generateFixtureService: GenerateFixturesService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.getDraftInfo(params['draftid']);
  }

  getDraftInfo(draftID): void {
    if (draftID) {
      this.isLoaderShown = true;
      forkJoin([this.ngFire.collection('seasonDrafts').doc(draftID).get(), this.isSeasonPublished$(draftID), this.getDraftFixtures(draftID)])
        .subscribe((response) => {
          this.seasonDraftData = response[0].data() as SeasonDraft;
          this.isSeasonPublished = response[1];
          this.setDraftFixtures(response[2], this.seasonDraftData?.grounds);
          const fees = this.seasonDraftData?.basicInfo?.fees || 0;
          this.finalFees = (fees - ((this.seasonDraftData?.basicInfo?.discount / 100) * fees));
          this.isLoaderShown = false;

        }, (error) => {
          this.isLoaderShown = false;
          this.finalFees = 0;
          this.seasonFixtures = [];
          this.seasonDraftData = null;
        });
    }
  }

  getStatusClass() {
    return this.generateFixtureService.getStatusClass(this.seasonDraftData?.status);
  }

  isSeasonPublished$(draftID): Observable<boolean> {
    return this.ngFire.collection('seasons').doc(draftID).get().pipe(map(resp => resp.exists));
  }

  editSeasonInfo() {
    // if (this.seasonDraftData?.draftID) {
    //   this.dialog.open(CreateSeasonComponent, {
    //     panelClass: 'extra-large-dialogs',
    //     disableClose: true,
    //     data: this.seasonDraftData.draftID
    //   })
    // }
  }

  onRaiseRequest() {
    this.dialog.open(RequestDialogComponent, {
      panelClass: 'fk-dialogs',
    })
  }

  onRaiseDeleteRequest() {
    this.dialog.open(RequestDialogComponent, {
      panelClass: 'fk-dialogs',
    })
  }

  publishSeason() {
    // forkJoin([this.groundAvailable$, this.checkSeasonPublish$]).subscribe(data => {
    if (this.seasonDraftData?.draftID && !this.isSeasonPublished) {
      this.isLoaderShown = true;
      const season: SeasonBasicInfo = {
        name: this.seasonDraftData.basicInfo?.name,
        imgpath: this.seasonDraftData.basicInfo?.imgpath,
        locCity: this.seasonDraftData.basicInfo?.city,
        locState: this.seasonDraftData.basicInfo?.state,
        premium: true,
        p_teams: this.seasonDraftData.basicInfo?.participatingTeamsCount,
        start_date: this.seasonDraftData.basicInfo?.startDate,
        cont_tour: this.seasonDraftData.basicInfo?.containingTournaments,
        feesPerTeam: this.seasonDraftData.basicInfo?.fees,
        discount: this.seasonDraftData.basicInfo?.discount,
        status: 'PUBLISHED'
      }
      const seasonAbout: SeasonAbout = {
        description: this.seasonDraftData.basicInfo?.description,
        rules: this.seasonDraftData.basicInfo?.rules,
        paymentMethod: 'Online',
      }
      const fixtures = this.generateFixtureService.getPublishableFixture(this.seasonFixtures);
      const startDate = season.start_date;
      const endDate = fixtures[fixtures.length - 1].date;
      const lastUpdated = new Date().getTime();
      const status: statusType = 'PUBLISHED';

      const allPromises = [];
      const batch = this.ngFire.firestore.batch();

      const seasonRef = this.ngFire.collection('seasons').doc(this.seasonDraftData.draftID).ref;
      const seasonMoreRef = this.ngFire.collection(`seasons/${this.seasonDraftData.draftID}/additionalInfo`).doc('moreInfo').ref;
      const draftRef = this.ngFire.collection(`seasonDrafts`).doc(this.seasonDraftData.draftID).ref;

      batch.set(seasonRef, season);
      batch.set(seasonMoreRef, seasonAbout);

      batch.update(draftRef, { lastUpdated, status });


      (this.seasonDraftData.grounds as GroundPrivateInfo[]).map(gr => gr.id).forEach(groundID => {
        const setRef = this.ngFire.collection('groundBookings').doc(groundID).ref;
        const booking: GroundBookings = { groundID, bookingFrom: (startDate as any).toMillis(), bookingTo: endDate.toMillis() };
        batch.set(setRef, booking);
      })

      fixtures.forEach(fixture => {
        const fixtureRef = this.ngFire.collection('allMatches').doc(fixture.id).ref;
        batch.set(fixtureRef, fixture);
      })


      batch.commit().then(
        () => {
          this.isLoaderShown = false;
          this.goToURL();
          location.reload();
        }, err => {
          this.isLoaderShown = false;
          this.snackbarService.displayError();
        }
      )

    }
    // })
  }

  setDraftFixtures(fixtures: dummyFixture[], groundsList: GroundPrivateInfo[]): void {
    if (groundsList && groundsList.length) {
      const groundsListNames = groundsList.map(ground => ground.name);
      this.seasonFixtures = fixtures.filter(fixture => groundsListNames.indexOf(fixture.stadium) > -1);
    } else {
      this.seasonFixtures = [];
    }
  }

  getDraftFixtures(draftID): Observable<dummyFixture[]> {
    return this.ngFire.collection('seasonFixturesDrafts', query => query.where('draftID', '==', draftID)).get()
      .pipe(
        map(response => response.docs.map(doc => doc.data() as dummyFixture)),
        map(response => response.map(doc => ({ ...doc, date: (doc.date as any).toDate() }))),
        map(response => response.sort(ArraySorting.sortObjectByKey('date'))),
        map(response => response as dummyFixture[])
      )
  }

  goToURL() {
    if (this.seasonDraftData?.basicInfo?.name) {
      window.open(`${MatchConstants.SEASON_URL}${this.seasonDraftData.basicInfo.name}`, "_blank");
    }
  }

  get containingTournaments(): string {
    return this.seasonDraftData?.basicInfo?.containingTournaments.join(', ')
  }

  get groundAvailable$(): Observable<boolean> {
    return this.ngFire.collection('groundBookings').snapshotChanges().pipe(map(resp => resp.length === 0));
  }

}
