import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatVerticalStepper } from '@angular/material/stepper';
import { FunctionsApiService } from '@shared/services/functions-api.service';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { RULES } from '@shared/web-content/MATCH-RELATED';
import { Observable } from 'rxjs';
import { StorageApiService } from '@shared/services/storage-api.service';
import { ITeam } from '@shared/interfaces/team.model';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';

@Component({
  selector: 'app-create-team-dialog',
  templateUrl: './create-team-dialog.component.html',
  styleUrls: ['./create-team-dialog.component.scss']
})
export class CreateTeamDialogComponent implements OnInit {

  teamDetailsForm: FormGroup;
  isLoaderShown = false;

  @ViewChild(MatVerticalStepper) stepper: MatVerticalStepper;

  constructor(
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private dialog: MatDialog,
    private functionsApiService: FunctionsApiService,
    private storageApiService: StorageApiService,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm();
    window.scrollTo(0, 0)
  }

  initForm() {
    this.teamDetailsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.alphaNumberWithSpace)], this.checkDuplicity.bind(this)),
      logo: new FormControl(null, [Validators.required])
    });
  }

  checkDuplicity(control: AbstractControl): Observable<ValidationErrors | null> {
    const name: string = (control.value as string).trim();
    if (name) {
      return this.apiService.checkDuplicateTeamName(name);
    }
    return null;
  }

  onSelectTeamLogo(file: File) {
    this.teamDetailsForm.get('logo').setValue(file);
  }

  openRules() {
    const data: IFeatureInfoOptions = {
      heading: 'Freekyk Rules & Regulations',
      description: RULES
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data
    })
  }

  async createTeam(): Promise<any> {
    const teamName = this.name.value;
    if (this.teamDetailsForm.invalid && !teamName) {
      return;
    }

    this.isLoaderShown = true;
    const data = {
      name: teamName,
      captainID: this.authService.getUser().uid
    };
    const teamCreationSnapshot = await this.functionsApiService.createTeam(data);
    if (teamCreationSnapshot) {
      this.uploadPhoto(teamCreationSnapshot)
        .then(() => {
          console.log('team created!');
          this.stepper.next();
        })
        .catch(() => {
          console.log('Error Occurred!')
        })
        .finally(() => {
          this.isLoaderShown = false;
        })
    } else {
      console.log('Team is not created!');
      this.snackbarService.displayError();
      this.isLoaderShown = false;
    }
  }

  async uploadPhoto(docID: string): Promise<any> {
    if (this.logo.valid) {
      const path = `/team-logos/${this.name.value}_${this.logo['name']}`;
      const url = await this.storageApiService.getPublicUrl(this.logo.value, path);
      const update: Partial<ITeam> = {}
      update.imgpath_logo = url;
      return this.apiPostService.updateTeamInfo(update, docID);
    }
  }

  navigateOut() {
    this.router.navigate(['/my-team']);
  }

  invitePlayers() {
    this.router.navigate(['/my-team', 'invite']);
  }

  get logo() {
    return this.teamDetailsForm.get('logo');
  }

  get name() {
    return this.teamDetailsForm.get('name');
  }

}
