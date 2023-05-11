import { GroundAdminService } from '@admin/main-shell/services/ground-admin.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { SnackbarService } from '@shared/services/snackbar.service';
import { groundFlowMessages } from '@shared/constants/messages';
import { ITiming } from '@shared/interfaces/others.model';
import { Subscription } from 'rxjs';
import { GroundAvailabilityComponent } from './components/ground-availability/ground-availability.component';
import { GroundDetailsComponent } from './components/ground-details/ground-details.component';

@Component({
  selector: 'app-register-ground',
  templateUrl: './register-ground.component.html',
  styleUrls: ['./register-ground.component.scss']
})
export class RegisterGroundComponent implements OnInit {

  @ViewChild(GroundDetailsComponent) groundDetailsComponent: GroundDetailsComponent;
  @ViewChild(GroundAvailabilityComponent) groundAvailabilityComponent: GroundAvailabilityComponent;

  readonly messages = groundFlowMessages;

  errorMessage = '';
  groundID: string;
  isLoaderShown = false;
  isPublished = false;
  maxSlots = 0;
  subscriptions = new Subscription();
  seasonID: string = '';

  constructor(
    private groundAdminService: GroundAdminService,
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

  onSaveDetails(stepper: MatHorizontalStepper) {
    if (this.groundDetailsForm?.valid) {
      sessionStorage.setItem('groundDetails', JSON.stringify(this.groundDetailsForm.value));
      stepper.next();
    }
  }

  onSaveAvailability(stepper: MatHorizontalStepper) {
    const value = this.timingsArray?.filter(el => el.selected);
    if (value && value.length) {
      sessionStorage.setItem('groundAvailability', JSON.stringify(value));
      stepper.next();
    } else {
      this.errorMessage = this.messages.availability.error.noSelection;
    }
  }

  onRegisterGround() {
    this.groundID = this.ngFire.createId();
    this.isLoaderShown = true;
    this.groundAdminService.registerGround(this.groundID)
      .then(() => {
        this.groundAdminService.uploadGroundDocs(this.groundID)
          .catch(this.handleError.bind(this))
          .finally(() => {
            this.groundAdminService.clearSavedData();
            this.isLoaderShown = false;
            this.isPublished = true;
          });
      })
      .catch(this.handleError.bind(this));
  }

  handleError(error) {
    this.isLoaderShown = false;
    this.isPublished = false;
    this.snackbarService.displayError(error?.message);
  }

  get groundDetailsForm(): FormGroup {
    return this.groundDetailsComponent?.groundDetailsForm;
  }

  get timingsArray(): ITiming[] {
    return this.groundAvailabilityComponent?.timingArray;
  }
}
