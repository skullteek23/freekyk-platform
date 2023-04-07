import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-create-instant-match',
  templateUrl: './create-instant-match.component.html',
  styleUrls: ['./create-instant-match.component.scss']
})
export class CreateInstantMatchComponent implements OnInit {

  matchDetailsForm: FormGroup;
  isLoaderShown = false;
  seasonsNamesList: string[] = [];

  constructor(
    private apiGetService: ApiGetService
  ) { }

  ngOnInit(): void {

    this.initForm();
  }

  initForm() {
    this.matchDetailsForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern(RegexPatterns.alphaNumberWithSpace), Validators.maxLength(50), this.seasonNameUnique.bind(this)
      ]),
      date: new FormControl()
    })
  }

  createMatch() { }

  getSeasons() {
    this.apiGetService.getSeasonNames().subscribe({
      next: (response) => {
        if (response && response.length) {
          this.seasonsNamesList = response;
        } else {
          this.seasonsNamesList = [];
        }
      }
    });
  }

  seasonNameUnique(control: AbstractControl): { [key: string]: any } | null {
    return this.seasonsNamesList?.findIndex(val => val?.toLowerCase() === String(control?.value)?.toLowerCase()) === -1 ? null : { nameTaken: true };
  }

}
