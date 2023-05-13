import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RegexPatterns } from '@shared/constants/REGEX';
import { AdminApiService } from '@admin/services/admin-api.service';
import { formsMessages } from '@shared/constants/messages';
import { Observable } from 'rxjs';
import { LocationService } from '@shared/services/location-cities.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit {

  messages = formsMessages;
  basicInfoForm: FormGroup = new FormGroup({});
  seasonsNamesList: string[] = [];
  cities$: Observable<string[]>;
  states$: Observable<string[]>;
  startTime: string = null;
  endTime: string = null;
  today = new Date();

  constructor(
    private adminApiService: AdminApiService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.getSeasons();
    this.initForm();
    this.onSelectCountry('India');
  }

  initForm() {
    this.basicInfoForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50), this.seasonNameUnique.bind(this)]),
      location: new FormGroup({
        state: new FormControl(null, [Validators.required]),
        city: new FormControl(null, [Validators.required]),
      }),
      groundName: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50)]),
      groundLink: new FormControl(null, Validators.required),
      startDate: new FormControl(null, Validators.required),
    });
  }

  getSeasons() {
    this.adminApiService.getSeasonNamesOnly().subscribe({
      next: (response) => {
        if (response && response.length) {
          this.seasonsNamesList = response;
        } else {
          this.seasonsNamesList = [];
        }
      }
    });
  }

  setStartDate(event: any) {
    const currentTime = new Date();
    const [hours, minutes] = event.split(':');

    currentTime.setHours(parseInt(hours, 10));
    currentTime.setMinutes(parseInt(minutes, 10));
    currentTime.setSeconds(0);

    console.log(currentTime);
    console.log(this.startTime)
  }

  setEndDate(event: any) {
    const currentTime = new Date();
    const [hours, minutes] = event.split(':');

    currentTime.setHours(parseInt(hours, 10));
    currentTime.setMinutes(parseInt(minutes, 10));
    currentTime.setSeconds(0);


    console.log(currentTime);
    console.log(this.endTime)
  }

  seasonNameUnique(control: AbstractControl): { [key: string]: any } | null {
    return this.seasonsNamesList?.findIndex(val => val?.toLowerCase() === String(control?.value)?.toLowerCase()) === -1 ? null : { nameTaken: true };
  }

  onSelectCountry(country: string): void {
    if (!country) {
      return;
    }
    this.states$ = this.locationService.getStateByCountry(country);
  }

  onSelectState(state: string): void {
    if (!state) {
      return;
    }
    this.cities$ = this.locationService.getCityByState(state);
  }

  get locationState(): FormControl {
    return ((this.basicInfoForm.get('location') as FormGroup).controls['state'] as FormControl);
  }

  get locationCity(): FormControl {
    return ((this.basicInfoForm.get('location') as FormGroup).controls['city'] as FormControl);
  }
}
