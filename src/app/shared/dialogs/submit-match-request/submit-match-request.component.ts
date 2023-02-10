import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { IMatchRequest } from '@shared/interfaces/match.model';
import { IFeedback } from '@shared/interfaces/ticket.model';
import { LocationService } from '@shared/services/location-cities.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-submit-match-request',
  templateUrl: './submit-match-request.component.html',
  styleUrls: ['./submit-match-request.component.scss']
})
export class SubmitMatchRequestComponent implements OnInit {

  readonly messages = formsMessages;

  requestForm: FormGroup;
  showError = false;
  showCompletion = false;
  countries$: Observable<string[]>;
  cities$: Observable<string[]>;
  states$: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<SubmitMatchRequestComponent>,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCountries();
  }

  initForm() {
    this.requestForm = new FormGroup({
      matches: new FormControl(null, [Validators.required]),
      perTeamPlayers: new FormControl(null, [Validators.required]),
      location: new FormGroup({
        country: new FormControl(null, Validators.required),
        state: new FormControl(null, Validators.required),
        city: new FormControl(null, Validators.required),
      }),
      ground: new FormControl(null, [Validators.required]),
      budget: new FormControl(null, [Validators.required]),
      contactNo: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
    })
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  getCountries() {
    this.countries$ = this.locationService.getCountry();
  }

  onSelectCountry(country: string): void {
    this.states$ = this.locationService.getStateByCountry(country);
  }

  onSelectState(state: string): void {
    this.cities$ = this.locationService.getCityByState(state);
  }

  get locationCountry(): FormControl {
    return ((this.requestForm.get('location') as FormGroup).controls['country'] as FormControl);
  }

  get locationState(): FormControl {
    return ((this.requestForm.get('location') as FormGroup).controls['state'] as FormControl);
  }

  get locationCity(): FormControl {
    return ((this.requestForm.get('location') as FormGroup).controls['city'] as FormControl);
  }

  submit() {
    if (this.isSubmitDisabled) {
      return;
    }
    const request: IMatchRequest = {
      matches: this.requestForm.value.matches,
      perTeamPlayers: this.requestForm.value.perTeamPlayers,
      location: {
        country: this.requestForm.value.location.country,
        state: this.requestForm.value.location.state,
        city: this.requestForm.value.location.city,
      },
      ground: this.requestForm.value.ground.trim(),
      budget: this.requestForm.value.budget,
      contactNo: this.requestForm.value.contactNo,
      name: this.requestForm.value.name.trim(),
      date: new Date().getTime()
    }
    this.ngFire.collection('matchRequests').add(request)
      .then(() => {
        this.showCompletion = true;
        this.requestForm?.reset();
      })
      .catch((response) => this.snackbarService.displayError())
  }

  get isSubmitDisabled(): boolean {
    return this.requestForm?.invalid;
  }
}
