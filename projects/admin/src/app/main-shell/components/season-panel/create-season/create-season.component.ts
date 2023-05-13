import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { Observable, Subscription } from 'rxjs';
import { SelectMatchTypeComponent } from './components/select-match-type/select-match-type.component';
import { SnackbarService } from '@shared/services/snackbar.service';
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { AdvancedInfoComponent } from './components/advanced-info/advanced-info.component';
import { SeasonAdminService } from '@admin/main-shell/services/season-admin.service';
import { seasonFlowMessages } from '@shared/constants/messages';
import { CanComponentDeactivate } from '@shared/guards/can-deactivate-guard.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { AdminApiService } from '@admin/services/admin-api.service';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.scss']
})
export class CreateSeasonComponent implements OnDestroy, OnInit, CanComponentDeactivate {

  @ViewChild(SelectMatchTypeComponent) selectMatchTypeComponent: SelectMatchTypeComponent;
  @ViewChild(BasicInfoComponent) basicInfoComponent: BasicInfoComponent;
  @ViewChild(AdvancedInfoComponent) advancedInfoComponent: AdvancedInfoComponent;
  // @ViewChild(SelectTeamsComponent) selectTeamsComponent: SelectTeamsComponent;
  // @ViewChild(SelectGroundComponent) selectGroundComponent: SelectGroundComponent;
  // @ViewChild(AddSeasonComponent) addSeasonComponent: AddSeasonComponent;
  // @ViewChild(GenerateFixturesComponent) generateFixturesComponent: GenerateFixturesComponent;
  // @ViewChild(AdminPaymentComponent) adminPaymentComponent: AdminPaymentComponent;

  readonly messages = seasonFlowMessages;

  isLoaderShown = false;
  isSeasonLive = false;
  errorMessage = '';
  subscriptions = new Subscription();
  formData: any;
  seasonID: any;
  // maxSlots = 0;
  // seasonID: string = '';

  constructor(
    private seasonAdminService: SeasonAdminService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private apiService: AdminApiService
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  save(stepper: MatVerticalStepper, form: FormGroup, elementID: string) {
    if (form?.valid) {
      this.formData = {
        ...this.formData,
        ...form.value
      }
      stepper.next();
      const element = document.getElementById(elementID);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  publish() {
    this.isLoaderShown = true;
    this.seasonID = this.apiService.getUniqueDocID();
    this.seasonAdminService.publishSeason(this.formData, this.seasonID)
      .then(() => {
        window.scrollTo(0, 0);
        this.isLoaderShown = false;
        this.isSeasonLive = true;
        // this.seasonAdminService.clearSavedData();
        // const file = this.seasonAdminService._selectedFile;
        // this.seasonAdminService.uploadSeasonPhoto(file)
        // .catch(this.handleError.bind(this))
        // .finally(() => {
        // });
      })
      .catch(this.handleError.bind(this));
  }

  handleError(error) {
    this.isLoaderShown = false;
    this.isSeasonLive = false;
    this.snackbarService.displayError(error?.message);
  }


  get matchSelectForm(): FormGroup {
    return this.selectMatchTypeComponent?.matchSelectForm;
  }

  get basicInfoForm(): FormGroup {
    return this.basicInfoComponent?.basicInfoForm;
  }

  get advancedInfoForm(): FormGroup {
    return this.advancedInfoComponent?.advancedInfoForm;
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    return this.dialog.open(ConfirmationBoxComponent).afterClosed().toPromise();
  }
  // onSaveTeam(stepper: MatVerticalStepper) {
  //   if (this.teamSelectForm?.valid) {
  //     sessionStorage.setItem('selectTeam', JSON.stringify(this.teamSelectForm.value));
  //     this.maxSlots = this.seasonAdminService.getMaxSelectableSlots();
  //     stepper.next();
  //   }
  // }

  // onSkipAndSaveTeam(stepper: MatVerticalStepper) {
  //   sessionStorage.removeItem('selectTeam');
  //   this.maxSlots = this.seasonAdminService.getMaxSelectableSlots();
  //   stepper.next();
  // }

  // onSaveGround(stepper: MatVerticalStepper) {
  //   if (this.isValidGroundSelection()) {
  //     this.errorMessage = '';
  //     sessionStorage.setItem('selectGround', JSON.stringify(this.seasonAdminService._selectedGrounds));
  //     stepper.next();
  //   }
  // }

  // onConfirmFixtures(stepper: MatVerticalStepper) {
  //   if (this.fixturesForm.valid) {
  //     this.errorMessage = '';
  //     sessionStorage.setItem('seasonFixtures', JSON.stringify(this.fixturesForm.value));
  //     stepper.next();
  //   }
  // }

  // onSaveDetails(stepper: MatVerticalStepper) {
  //   if (this.detailsForm?.valid) {
  //     sessionStorage.setItem('seasonDetails', JSON.stringify(this.detailsForm.value));
  //     stepper.next();
  //   }
  // }

  // onFinishPayment(stepper: MatVerticalStepper) {
  //   if (this.paymentForm.valid) {
  //     stepper.next();
  //   }
  // }

  // isValidGroundSelection(): boolean {
  //   let totalSelectionLength: number = 0;
  //   this.seasonAdminService._selectedGrounds.forEach(ground => {
  //     totalSelectionLength += ground.slots.length;
  //   });
  //   if (totalSelectionLength < this.maxSlots) {
  //     this.errorMessage = this.messages.selectGround.error.slotsUnderflow;
  //   } else if (totalSelectionLength > this.maxSlots) {
  //     this.errorMessage = this.messages.selectGround.error.slotsOverflow;
  //   } else if (this.maxSlots === 0 || totalSelectionLength === 0) {
  //     this.errorMessage = this.messages.selectGround.error.noSelection;
  //   }
  //   return (totalSelectionLength === this.maxSlots) && this.groundForm.valid && this.maxSlots > 0;
  // }

  // get teamSelectForm(): FormGroup {
  //   return this.selectTeamsComponent?.teamSelectForm;
  // }

  // get groundForm(): FormGroup {
  //   return this.selectGroundComponent?.groundForm;
  // }

  // get detailsForm(): FormGroup {
  //   return this.addSeasonComponent?.detailsForm;
  // }

  // get fixturesForm(): FormGroup {
  //   return this.generateFixturesComponent?.fixturesForm;
  // }

  // get paymentForm(): FormGroup {
  // return this.adminPaymentComponent?.paymentForm;
  // }
}
