import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { Subscription } from 'rxjs';
import { AddSeasonComponent } from './components/add-season/add-season.component';
import { SelectMatchTypeComponent } from './components/select-match-type/select-match-type.component';
import { SelectTeamsComponent } from './components/select-teams/select-teams.component';
import { SelectGroundComponent } from './components/select-ground/select-ground.component';
import { SeasonAdminService } from '../season-admin.service';
import { seasonFlowMessages } from '@shared/constants/messages';
import { AdminPaymentComponent } from './components/admin-payment/admin-payment.component';
import { GenerateFixturesComponent } from '../generate-fixtures/generate-fixtures.component';
import { SnackbarService } from '@app/services/snackbar.service';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-create-season',
  templateUrl: './create-season.component.html',
  styleUrls: ['./create-season.component.scss']
})
export class CreateSeasonComponent implements OnDestroy, OnInit {

  @ViewChild(SelectMatchTypeComponent) selectMatchTypeComponent: SelectMatchTypeComponent;
  @ViewChild(SelectTeamsComponent) selectTeamsComponent: SelectTeamsComponent;
  @ViewChild(SelectGroundComponent) selectGroundComponent: SelectGroundComponent;
  @ViewChild(AddSeasonComponent) addSeasonComponent: AddSeasonComponent;
  @ViewChild(GenerateFixturesComponent) generateFixturesComponent: GenerateFixturesComponent;
  @ViewChild(AdminPaymentComponent) adminPaymentComponent: AdminPaymentComponent;

  readonly messages = seasonFlowMessages;

  isLoaderShown = false;
  isSeasonLive = false;
  errorMessage = '';
  maxSlots = 0;
  subscriptions = new Subscription();
  seasonID: string = '';

  constructor(
    private seasonAdminService: SeasonAdminService,
    private snackbarService: SnackbarService,
    private ngFire: AngularFirestore
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onSaveMatchType(stepper: MatHorizontalStepper) {
    if (this.matchSelectForm?.valid) {
      sessionStorage.setItem('selectMatchType', JSON.stringify(this.matchSelectForm.value));
      stepper.next();
    }
  }

  onSaveTeam(stepper: MatHorizontalStepper) {
    if (this.teamSelectForm?.valid) {
      sessionStorage.setItem('selectTeam', JSON.stringify(this.teamSelectForm.value));
      this.maxSlots = this.seasonAdminService.getMaxSelectableSlots();
      stepper.next();
    }
  }

  onSkipAndSaveTeam(stepper: MatHorizontalStepper) {
    sessionStorage.removeItem('selectTeam');
    this.maxSlots = this.seasonAdminService.getMaxSelectableSlots();
    stepper.next();
  }

  onSaveGround(stepper: MatHorizontalStepper) {
    if (this.isValidGroundSelection()) {
      this.errorMessage = '';
      sessionStorage.setItem('selectGround', JSON.stringify(this.seasonAdminService._selectedGrounds));
      stepper.next();
    }
  }

  onConfirmFixtures(stepper: MatHorizontalStepper) {
    if (this.fixturesForm.valid) {
      this.errorMessage = '';
      sessionStorage.setItem('seasonFixtures', JSON.stringify(this.fixturesForm.value));
      stepper.next();
    }
  }

  onSaveDetails(stepper: MatHorizontalStepper) {
    if (this.detailsForm?.valid) {
      sessionStorage.setItem('seasonDetails', JSON.stringify(this.detailsForm.value));
      stepper.next();
    }
  }

  onFinishPayment(stepper: MatHorizontalStepper) {
    if (this.paymentForm.valid) {
      stepper.next();
    }
  }

  onPublishSeason() {
    this.seasonID = this.ngFire.createId();
    this.isLoaderShown = true;
    this.seasonAdminService.publishSeason(this.seasonID)
      .then(() => {
        this.seasonAdminService.clearSavedData();
        this.isLoaderShown = false;
        this.isSeasonLive = true;
      })
      .catch(error => {
        this.isLoaderShown = false;
        this.isSeasonLive = false;
        if (error?.message) {
          this.snackbarService.displayError(error?.message);
        }
      });
  }

  isValidGroundSelection(): boolean {
    let totalSelectionLength: number = 0;
    this.seasonAdminService._selectedGrounds.forEach(ground => {
      totalSelectionLength += ground.slots.length;
    });
    if (totalSelectionLength < this.maxSlots) {
      this.errorMessage = this.messages.selectGround.error.slotsUnderflow;
    } else if (totalSelectionLength > this.maxSlots) {
      this.errorMessage = this.messages.selectGround.error.slotsOverflow;
    } else if (this.maxSlots === 0 || totalSelectionLength === 0) {
      this.errorMessage = this.messages.selectGround.error.noSelection;
    }
    return (totalSelectionLength === this.maxSlots) && this.groundForm.valid && this.maxSlots > 0;
  }

  get matchSelectForm(): FormGroup {
    return this.selectMatchTypeComponent?.matchSelectForm;
  }

  get teamSelectForm(): FormGroup {
    return this.selectTeamsComponent?.teamSelectForm;
  }

  get groundForm(): FormGroup {
    return this.selectGroundComponent?.groundForm;
  }

  get detailsForm(): FormGroup {
    return this.addSeasonComponent?.detailsForm;
  }

  get fixturesForm(): FormGroup {
    return this.generateFixturesComponent?.fixturesForm;
  }

  get paymentForm(): FormGroup {
    return this.adminPaymentComponent?.paymentForm;
  }
}
