import { Component, OnDestroy, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { dummyFixture } from 'src/app/shared/interfaces/match.model';
import { SeasonDraft } from 'src/app/shared/interfaces/season.model';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { MatchConstants, MatchConstantsSecondary } from '../../shared/constants/constants';
import { AddSeasonComponent } from '../add-season/add-season.component';
import { GenerateFixturesComponent } from '../generate-fixtures/generate-fixtures.component';
import { SelectGroundsComponent } from '../select-grounds/select-grounds.component';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.css']
})
export class CreateSeasonComponent implements OnDestroy {

  availableGroundsList: GroundPrivateInfo[] = [];
  selectedGroundsList: GroundPrivateInfo[] = [];
  dataForGroundStep: any = null;
  dataForFixtureStep: any = null;
  draftID = '';
  isLoaderShown = false;
  subscriptions = new Subscription();

  @ViewChild(MatHorizontalStepper) stepper: MatHorizontalStepper;
  @ViewChild(AddSeasonComponent) addSeasonComponent: AddSeasonComponent;
  @ViewChild(SelectGroundsComponent) selectGroundsComponent: SelectGroundsComponent;
  @ViewChild(GenerateFixturesComponent) generateFixturesComponent: GenerateFixturesComponent;

  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    public dialogRef: MatDialogRef<CreateSeasonComponent>,
    private router: Router,
    private snackBarService: SnackbarService,
    private ngStorage: AngularFireStorage
  ) {
    this.draftID = ngFire.createId();
    const qParams = route.snapshot.queryParams;
    if (qParams && qParams['draft']) {
      const draftID = qParams['draft'];
      this.navigateToDraftAndClose(draftID);
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  navigateToDraftAndClose(draftID) {
    this.router.navigate(['/seasons/s/' + draftID]);
    this.onCloseDialog();
  }

  navigateToListAndClose() {
    this.router.navigate(['/seasons/list']);
    this.onCloseDialog();
  }

  getGrounds(city: string, state: string, date: Date) {
    this.isLoaderShown = true;
    this.subscriptions.add(this.ngFire.collection('groundsPvt', (query) => query.where('locState', '==', state.trim()).where('locCity', '==', city.trim()).where('contractStartDate', '<', date))
      .snapshotChanges()
      .subscribe(
        (response) => {
          this.availableGroundsList = response.map(docs => ({ id: docs.payload.doc.id, ...docs.payload.doc.data() as GroundPrivateInfo }) as GroundPrivateInfo);
          this.availableGroundsList.sort(ArraySorting.sortObjectByKey('name'));
          this.isLoaderShown = false;
        }, (err) => {
          this.isLoaderShown = false;
          this.snackBarService.displayError();
        }
      ))
  }

  saveDetails() {
    this.router.navigate(['/seasons/list'])
    this.onCloseDialog();
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  get seasonForm(): FormGroup {
    if (this.addSeasonComponent && this.addSeasonComponent.seasonForm) {
      return this.addSeasonComponent.seasonForm;
    }
    return null;
  }

  get groundForm(): FormGroup {
    if (this.selectGroundsComponent && this.selectGroundsComponent.groundsForm) {
      return this.selectGroundsComponent.groundsForm;
    }
    return null;
  }

  get fixtureForm(): FormGroup {
    if (this.generateFixturesComponent && this.generateFixturesComponent.fixturesForm) {
      return this.generateFixturesComponent.fixturesForm;
    }
    return null;
  }

  get seasonName(): string {
    if (this.addSeasonComponent && this.addSeasonComponent.seasonForm && this.addSeasonComponent.seasonForm.get('name').value) {
      return `Season Name: ${this.addSeasonComponent.seasonForm.get('name').value}`;
    }
    return '';
  }

  get seasonImage(): File {
    return this.addSeasonComponent && this.addSeasonComponent.selectedImageFile ? this.addSeasonComponent.selectedImageFile : null;
  }

  onCancel() {
    this.onCloseDialog();
  }

  onNextStep(): void {
    this.stepper.next();
  }

  async onSaveDraft() {
    if (this.isSeasonFormValid) {
      this.dataForGroundStep = this.seasonForm.value;
      this.isLoaderShown = true;
      const imgpath = this.seasonImage ? await this.getImageURL(this.seasonImage) : MatchConstantsSecondary.DEFAULT_PLACEHOLDER;
      const formData = {
        ...this.seasonForm.value,
        imgpath
      };
      this.saveDraftDetails(formData);
    } else {
      this.dataForGroundStep = null;
    }
  }

  onUpdateDraft(): void {
    if (this.isGroundFormValid) {
      this.isLoaderShown = true;
      this.selectedGroundsList = (this.groundForm.value['groundsList'] as GroundPrivateInfo[]);
      this.dataForFixtureStep = {
        season: this.dataForGroundStep,
        grounds: this.selectedGroundsList
      }
      if (this.selectedGroundsList.length) {
        const result = this.ngFire.collection('seasonDrafts').doc(this.draftID).update({
          grounds: this.selectedGroundsList
        } as Partial<SeasonDraft>)
        result.then(() => {
          this.snackBarService.displayCustomMsg('draft updated successfully!');
          this.router.navigate([], { relativeTo: this.route, queryParams: { draft: this.draftID } })
          this.onNextStep();
          this.isLoaderShown = false;
        })
      } else {
        this.isLoaderShown = false;
      }
    }
  }

  onConfirmFixtures() {
    if (this.isFixtureFormValid) {
      this.isLoaderShown = true;
      const fixtures = this.fixtureForm.value.fixtures;
      this.saveDraftFixtures(fixtures);
    }
  }

  saveDraftFixtures(fixtures: dummyFixture[]): void {
    const batch = this.ngFire.firestore.batch();

    fixtures.forEach(element => {
      if (element && element.hasOwnProperty('id') && element['id']) {
        const colRef = this.ngFire.collection('seasonFixturesDrafts').doc(element?.id).ref;
        batch.set(colRef, { draftID: this.draftID, ...element });
      }
    });

    // updating drafted season
    const docRef = this.ngFire.collection('seasonDrafts').doc(this.draftID).ref;
    batch.update(docRef, { status: 'READY TO PUBLISH' } as Partial<SeasonDraft>);

    batch.commit().then(() => {
      this.snackBarService.displayCustomMsg('draft fixtures saved successfully!');
      this.onNextStep();
      this.isLoaderShown = false;
    }, (err) => {
      this.isLoaderShown = false;
      this.snackBarService.displayError();
    });
  }

  saveDraftDetails(formData: any) {
    const seasonDraft: SeasonDraft = {
      draftID: this.draftID,
      basicInfo: formData,
      lastUpdated: new Date().getTime(),
      status: 'DRAFTED'
    }
    this.ngFire.collection('seasonDrafts').doc(this.draftID).get().subscribe(val => {
      let result: Promise<any>;
      if (val.exists) {
        result = this.ngFire.collection('seasonDrafts').doc(this.draftID).update(seasonDraft);
      } else {
        result = this.ngFire.collection('seasonDrafts').doc(this.draftID).set(seasonDraft);
      }
      result.then(() => {
        this.snackBarService.displayCustomMsg('Season drafted successfully!');
        if (seasonDraft?.basicInfo?.city && seasonDraft?.basicInfo?.state && seasonDraft?.basicInfo?.startDate) {
          this.isLoaderShown = false;
          this.getGrounds(seasonDraft.basicInfo.city, seasonDraft.basicInfo.state, seasonDraft.basicInfo.startDate);
          this.router.navigate([], { relativeTo: this.route, queryParams: { draft: this.draftID } })
          this.onNextStep();
        }
      }, (err) => {
        this.isLoaderShown = false;
      });
    })
  }

  async getImageURL(fileObj: File): Promise<string> {
    if (fileObj && fileObj.name) {
      const imageSnapshot = await this.ngStorage.upload('/seasonImages/' + fileObj.name.trim(), fileObj);
      return imageSnapshot.ref.getDownloadURL();
    }
    return null;
  }

  get isSeasonFormValid(): boolean {
    return this.seasonForm && this.seasonForm.valid && this.seasonForm.dirty;
  }

  get isGroundFormValid(): boolean {
    return this.groundForm && this.groundForm.valid;
  }

  get isFixtureFormValid(): boolean {
    return this.fixtureForm && this.fixtureForm.valid && this.fixtureForm.value && this.fixtureForm.value['fixtures'] && this.fixtureForm.value['fixtures'].length;
  }
}