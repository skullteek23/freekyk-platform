import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { SnackbarService } from '@shared/services/snackbar.service';
import { ISelectTeam, ISelectMatchType } from '@shared/interfaces/season.model';
import { ITeamInfo, TeamBasicInfo } from '@shared/interfaces/team.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-select-teams',
  templateUrl: './select-teams.component.html',
  styleUrls: ['./select-teams.component.scss']
})
export class SelectTeamsComponent implements OnInit {

  @Input() stepper: MatHorizontalStepper;

  isLoaderShown = false;
  teamSelectForm: FormGroup;
  teamList: ITeamInfo[] = [];

  constructor(
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initComponentValues();
  }

  initComponentValues() {
    this.initForm();
    this.getTeams();
  }

  initForm() {
    this.teamSelectForm = new FormGroup({
      participants: new FormArray([], this.hasDuplicate())
    });
  }

  getTeams() {
    this.isLoaderShown = true;
    this.ngFire.collection('teams').get()
      .pipe(
        map(response => response.empty ? [] : response.docs.map(doc => ({ id: doc.id, name: (doc.data() as TeamBasicInfo).tname } as ITeamInfo)))
      )
      .subscribe({
        next: (response) => {
          if (response && response.length) {
            this.teamList = response;
            this.getLastSavedData();
          }
          this.isLoaderShown = false;
        },
        error: (error) => {
          this.isLoaderShown = false;
          this.teamList = [];
          this.snackbarService.displayError('Unable to get teams');
        }
      });
  }

  getLastSavedData() {
    const selectTeamFormData: ISelectTeam = JSON.parse(sessionStorage.getItem('selectTeam'));
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    if (selectMatchTypeFormData) {
      this.initControls(selectMatchTypeFormData?.participatingTeamsCount, selectTeamFormData?.participants);
    } else {
      this.snackbarService.displayError('Please finish previous steps!');
    }
  }

  initControls(limit: number, values: ITeamInfo[]): void {
    if (!limit) {
      this.participants.reset();
      return;
    }
    for (let i = 0; i < limit; i++) {
      const control = new FormControl(values && values[i] ? values[i] : null, Validators.required);
      this.participants.insert(i, control);
    }
  }

  hasDuplicate(): ValidatorFn {
    return (formArray: FormArray): { [key: string]: boolean } | null => {
      const uniqueSelectionSet = new Set<string>();
      const currentSet = formArray.value as string[];
      const validSet = currentSet.filter(value => value !== null);
      validSet.forEach(el => uniqueSelectionSet.add(el));
      if (validSet && currentSet && uniqueSelectionSet && uniqueSelectionSet.size !== validSet?.length) {
        return { duplicated: true };
      }
      return null;
    };
  }

  compareFunction(a: ITeamInfo, b: ITeamInfo): boolean {
    return a && b ? a.id === b.id : a === b;
  }

  get participants(): FormArray {
    return this.teamSelectForm?.get('participants') as FormArray;
  }

}
