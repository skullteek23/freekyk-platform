import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatVerticalStepper } from '@angular/material/stepper';
import { FunctionsApiService } from '@shared/services/functions-api.service';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { ApiGetService, ApiSetService } from '@shared/services/api.service';
import { RULES } from '@shared/web-content/MATCH-RELATED';
import { Observable } from 'rxjs';
import { StorageApiService } from '@shared/services/storage-api.service';
import { ITeam } from '@shared/interfaces/team.model';
import { Router } from '@angular/router';

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
    private apiSetService: ApiSetService,
    private dialog: MatDialog,
    private functionsApiService: FunctionsApiService,
    private storageApiService: StorageApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
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
    if (this.teamDetailsForm.invalid) {
      return;
    }
    const uid = localStorage.getItem('uid');
    const teamName = this.name.value;

    if (uid && teamName) {
      this.isLoaderShown = true;
      const data = {
        name: teamName,
        captainID: uid
      };
      const teamCreationSnapshot = await this.functionsApiService.createTeam(data);
      if (teamCreationSnapshot) {
        console.log('team created!');
        this.uploadPhoto(teamCreationSnapshot)
          .then(() => {
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
        this.isLoaderShown = false;
      }
    } else {
      console.log('User is not logged in!');
      const encodedString = encodeURIComponent('/teams/create');
      this.router.navigate(['/signup'], { queryParams: { callback: encodedString } });
    }
  }

  async uploadPhoto(docID: string): Promise<any> {
    if (this.logo.valid) {
      const path = `/team-logos/${this.name.value}_${this.logo['name']}`;
      const url = await this.storageApiService.getPublicUrl(this.logo.value, path);
      const update: Partial<ITeam> = {}
      update.imgpath_logo = url;
      return this.apiSetService.updateTeamInfo(update, docID);
    }
  }

  get logo() {
    return this.teamDetailsForm.get('logo');
  }

  get name() {
    return this.teamDetailsForm.get('name');
  }

}
