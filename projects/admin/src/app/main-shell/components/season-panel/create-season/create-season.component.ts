import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundPrivateInfo } from '@shared/interfaces/ground.model';
import { dummyFixture } from '@shared/interfaces/match.model';
import { SeasonDraft } from '@shared/interfaces/season.model';
import { ArraySorting } from '@shared/utils/array-sorting';
import { MatchConstantsSecondary, MATCH_TYPES_PACKAGES } from '@shared/constants/constants';
import { AddSeasonComponent } from '../add-season/add-season.component';
import { GenerateFixturesComponent } from '../generate-fixtures/generate-fixtures.component';
import { SelectGroundsComponent } from '../select-grounds/select-grounds.component';
import { SelectMatchTypeComponent } from './components/select-match-type/select-match-type.component';
import { SelectTeamsComponent } from './components/select-teams/select-teams.component';
import { SelectGroundComponent } from './components/select-ground/select-ground.component';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.scss']
})
export class CreateSeasonComponent implements OnDestroy, OnInit {

  @ViewChild(SelectMatchTypeComponent) selectMatchTypeComponent: SelectMatchTypeComponent;
  @ViewChild(SelectTeamsComponent) selectTeamsComponent: SelectTeamsComponent;
  @ViewChild(SelectGroundComponent) selectGroundComponent: SelectGroundComponent;

  // @ViewChild(AddSeasonComponent) addSeasonComponent: AddSeasonComponent;
  // @ViewChild(SelectGroundsComponent) selectGroundsComponent: SelectGroundsComponent;
  // @ViewChild(GenerateFixturesComponent) generateFixturesComponent: GenerateFixturesComponent;

  isLoaderShown = false;
  // availableGroundsList: GroundPrivateInfo[] = [];
  // selectedGroundsList: GroundPrivateInfo[] = [];
  // dataForGroundStep: any = null;
  // dataForFixtureStep: any = null;
  // draftID = '';
  // maxTeams = 0;
  subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private router: Router,
    private snackBarService: SnackbarService,
    private ngStorage: AngularFireStorage
  ) {

  }
  ngOnInit(): void {
    // this.initForm();
    // this.draftID = ngFire.createId();
    // const qParams = route.snapshot.queryParams;
    // if (qParams && qParams.draft) {
    //   const draftID = qParams.draft;
    //   this.navigateToDraftAndClose(draftID);
    // }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onSaveMatchType(stepper: MatHorizontalStepper) {
    if (this.matchSelectForm?.valid) {
      sessionStorage.setItem('selectMatchType', JSON.stringify(this.matchSelectForm.value));
      this.selectTeamsComponent?.initComponentValues();
      stepper.next();
    }
  }

  onSaveTeam(stepper: MatHorizontalStepper) {
    if (this.teamSelectForm?.valid) {
      sessionStorage.setItem('selectTeam', JSON.stringify(this.teamSelectForm.value));
      stepper.next();
    }
  }

  onSaveGround(stepper: MatHorizontalStepper) {
    if (this.groundForm?.valid) {
      sessionStorage.setItem('selectGround', JSON.stringify(this.groundForm.value));
      stepper.next();
    }
  }

  // navigateToDraftAndClose(draftID) {
  //   this.router.navigate(['/seasons/s/' + draftID]);
  // }

  // navigateToListAndClose() {
  //   this.onNavigateAway();
  // }

  // getGrounds(city: string, state: string, startDate: number) {
  //   this.isLoaderShown = true;
  //   this.subscriptions.add(
  //     this.ngFire.collection('groundsPvt', (query) => query.where('locState', '==', state.trim()).where('locCity', '==', city.trim())
  //       .where('contractStartDate', '<', startDate))
  //       .snapshotChanges()
  //       .pipe(
  //         map(response => response
  //           .map(docs => ({ id: docs.payload.doc.id, ...docs.payload.doc.data() as GroundPrivateInfo }) as GroundPrivateInfo)
  //         ),
  //         map(response => response.sort(ArraySorting.sortObjectByKey('name'))),
  //         map(resp => resp.filter(res => res.contractEndDate > startDate))
  //       )
  //       .subscribe(
  //         (response) => {
  //           this.availableGroundsList = response;
  //           this.isLoaderShown = false;
  //         }, (err) => {
  //           this.isLoaderShown = false;
  //           this.snackBarService.displayError('Unable to get grounds!');
  //         }
  //       )
  //   );
  // }

  // onNavigateAway() {
  //   this.router.navigate(['/seasons/list']);
  // }

  // saveDetails() {
  //   this.onNavigateAway();
  // }

  get matchSelectForm(): FormGroup {
    if (this.selectMatchTypeComponent) {
      return this.selectMatchTypeComponent.matchSelectForm;

    }
  }

  get teamSelectForm(): FormGroup {
    return this.selectTeamsComponent?.teamSelectForm;
  }

  get groundForm(): FormGroup {
    return this.selectGroundComponent?.groundForm;
  }

  // get seasonForm(): FormGroup {
  //   if (this.addSeasonComponent && this.addSeasonComponent.seasonForm) {
  //     return this.addSeasonComponent.seasonForm;
  //   }
  //   return null;
  // }

  // get groundForm(): FormGroup {
  //   if (this.selectGroundsComponent && this.selectGroundsComponent.groundsForm) {
  //     return this.selectGroundsComponent.groundsForm;
  //   }
  //   return null;
  // }

  // get fixtureForm(): FormGroup {
  //   if (this.generateFixturesComponent && this.generateFixturesComponent.fixturesForm) {
  //     return this.generateFixturesComponent.fixturesForm;
  //   }
  //   return null;
  // }

  // get seasonName(): string {
  //   if (this.addSeasonComponent && this.addSeasonComponent.seasonForm && this.addSeasonComponent.seasonForm.get('name').value) {
  //     return `Season Name: ${this.addSeasonComponent.seasonForm.get('name').value}`;
  //   }
  //   return '';
  // }

  // get seasonImage(): File {
  //   return this.addSeasonComponent && this.addSeasonComponent.selectedImageFile ? this.addSeasonComponent.selectedImageFile : null;
  // }

  // onCancel() {

  // }

  // nextStep() {
  //   console.log('event received in parent!');
  //   console.log(this.stepper);
  //   this.stepper.next();
  // }

  // async onSaveDraft() {
  //   if (this.isSeasonFormValid) {
  //     this.dataForGroundStep = this.seasonForm.value;
  //     this.isLoaderShown = true;
  //     const imgpath = this.seasonImage ? await this.getImageURL(this.seasonImage) : MatchConstantsSecondary.DEFAULT_PLACEHOLDER;
  //     const formData = {
  //       ...this.seasonForm.value,
  //       startDate: new Date(this.seasonForm.value.startDate).getTime(),
  //       imgpath
  //     };
  //     this.saveDraftDetails(formData);
  //   } else {
  //     this.dataForGroundStep = null;
  //   }
  // }

  // onUpdateDraft(): void {
  //   if (this.isGroundFormValid) {
  //     this.isLoaderShown = true;
  //     this.selectedGroundsList = (this.groundForm.value.groundsList as GroundPrivateInfo[]);
  //     this.dataForFixtureStep = {
  //       season: this.dataForGroundStep,
  //       grounds: this.selectedGroundsList
  //     };
  //     if (this.selectedGroundsList.length) {
  //       const result = this.ngFire.collection('seasonDrafts').doc(this.draftID).update({
  //         grounds: this.selectedGroundsList
  //       } as Partial<SeasonDraft>);
  //       result.then(() => {
  //         this.snackBarService.displayCustomMsg('draft updated successfully!');
  //         this.router.navigate([], { relativeTo: this.route, queryParams: { draft: this.draftID } });
  //         // this.onNextStep();
  //         this.isLoaderShown = false;
  //       });
  //     } else {
  //       this.isLoaderShown = false;
  //     }
  //   }
  // }

  // onConfirmFixtures() {
  //   if (this.isFixtureFormValid) {
  //     this.isLoaderShown = true;
  //     const fixtures = this.fixtureForm.value.fixtures;
  //     this.saveDraftFixtures(fixtures);
  //   }
  // }

  // saveDraftFixtures(fixtures: dummyFixture[]): void {
  //   const batch = this.ngFire.firestore.batch();

  //   fixtures.forEach(element => {
  //     if (element && element.hasOwnProperty('id') && element.id) {
  //       const colRef = this.ngFire.collection('seasonFixturesDrafts').doc(element?.id).ref;
  //       batch.set(colRef, { draftID: this.draftID, ...element });
  //     }
  //   });

  //   // updating drafted season
  //   const docRef = this.ngFire.collection('seasonDrafts').doc(this.draftID).ref;
  //   batch.update(docRef, { status: 'READY TO PUBLISH' } as Partial<SeasonDraft>);

  //   batch.commit().then(() => {
  //     this.snackBarService.displayCustomMsg('draft fixtures saved successfully!');
  //     // this.onNextStep();
  //     this.isLoaderShown = false;
  //   }, (err) => {
  //     this.isLoaderShown = false;
  //     this.snackBarService.displayError('Unable to save drafted fixtures');
  //   });
  // }

  // saveDraftDetails(formData: any) {
  //   const uid = sessionStorage.getItem('uid');
  //   const seasonDraft: SeasonDraft = {
  //     draftID: this.draftID,
  //     basicInfo: formData,
  //     lastUpdated: new Date().getTime(),
  //     status: 'DRAFTED',
  //     createdBy: uid
  //   };
  //   this.ngFire.collection('seasonDrafts').doc(this.draftID).get().subscribe(val => {
  //     let result: Promise<any>;
  //     if (val.exists) {
  //       result = this.ngFire.collection('seasonDrafts').doc(this.draftID).update(seasonDraft);
  //     } else {
  //       result = this.ngFire.collection('seasonDrafts').doc(this.draftID).set(seasonDraft);
  //     }
  //     result.then(() => {
  //       this.snackBarService.displayCustomMsg('Season drafted successfully!');
  //       if (seasonDraft?.basicInfo?.city && seasonDraft?.basicInfo?.state && seasonDraft?.basicInfo?.startDate) {
  //         this.isLoaderShown = false;
  //         this.getGrounds(seasonDraft.basicInfo.city, seasonDraft.basicInfo.state, seasonDraft.basicInfo.startDate);
  //         this.router.navigate([], { relativeTo: this.route, queryParams: { draft: this.draftID } });
  //         // this.onNextStep();
  //       }
  //     }, (err) => {
  //       this.isLoaderShown = false;
  //     });
  //   });
  // }

  // async getImageURL(fileObj: File): Promise<string> {
  //   if (fileObj && fileObj.name) {
  //     const imageSnapshot = await this.ngStorage.upload('/seasonImages/' + fileObj.name.trim(), fileObj);
  //     return imageSnapshot.ref.getDownloadURL();
  //   }
  //   return null;
  // }

  // get isSeasonFormValid(): boolean {
  //   return this.seasonForm && this.seasonForm.valid && this.seasonForm.dirty;
  // }

  // get isGroundFormValid(): boolean {
  //   return this.groundForm && this.groundForm.valid;
  // }

  // get isFixtureFormValid(): boolean {
  //   return this.fixtureForm
  //     && this.fixtureForm.valid
  //     && this.fixtureForm.value
  //     && this.fixtureForm.value.fixtures
  //     && this.fixtureForm.value.fixtures.length;
  // }
}
