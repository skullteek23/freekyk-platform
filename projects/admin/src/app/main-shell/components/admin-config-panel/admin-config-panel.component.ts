import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { AdminConfigurationSeason } from '@shared/interfaces/admin.model';
import { LastParticipationDate } from '@shared/interfaces/season.model';

@Component({
  selector: 'app-admin-config-panel',
  templateUrl: './admin-config-panel.component.html',
  styleUrls: ['./admin-config-panel.component.scss']
})
export class AdminConfigPanelComponent implements OnInit {

  readonly messages = formsMessages;
  readonly allowedParticipationDate = [
    LastParticipationDate.sameDate,
    LastParticipationDate.oneDayBefore,
    LastParticipationDate.threeDayBefore,
    LastParticipationDate.oneWeekBefore,
  ];

  configForm: FormGroup;
  isLoaderShown = false;

  constructor(
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.intiForm();
    this.getConfigurations();
  }

  intiForm() {
    this.configForm = new FormGroup({
      duration: new FormControl(MatchConstants.ONE_MATCH_DURATION, [Validators.required, Validators.pattern(RegexPatterns.matchDuration)]),
      lastParticipationDate: new FormControl('Same as Tournament Start Date', [Validators.required]),
    });
  }

  getConfigurations() {
    this.isLoaderShown = true;
    this.ngFire.collection('adminConfigs').doc('season').get().subscribe({
      next: (response) => {
        if (response && response.exists) {
          const data = response.data() as AdminConfigurationSeason;
          this.configForm.patchValue({
            ...data
          });
        }
        this.isLoaderShown = false;
      },
      error: () => {
        this.isLoaderShown = false;
      }
    });
  }

  saveConfig() {
    if (this.configForm.valid && this.configForm.value) {
      const config: AdminConfigurationSeason = {
        duration: this.duration?.value,
        lastParticipationDate: this.lastParticipationDate?.value?.trim()
      };
      this.isLoaderShown = true;
      this.ngFire.collection('adminConfigs').doc('season').set({
        ...config
      })
        .then(() => {
          this.configForm.reset();
          this.getConfigurations();
          this.snackbarService.displayCustomMsg('Updated successfully');
          this.isLoaderShown = false;
        })
        .catch(() => {
          this.snackbarService.displayError('Update failed');
          this.isLoaderShown = false;
        });
    }
  }

  get duration() {
    return this.configForm.get('duration');
  }

  get lastParticipationDate() {
    return this.configForm.get('lastParticipationDate');
  }
}
