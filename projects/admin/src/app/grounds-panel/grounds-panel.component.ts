import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm, FormGroup, FormControl, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundBasicInfo, GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { MatchConstants, MatchConstantsSecondary } from '../shared/constants/constants';
@Component({
  selector: 'app-grounds-panel',
  templateUrl: './grounds-panel.component.html',
  styleUrls: ['./grounds-panel.component.css'],
})
export class GroundsPanelComponent implements OnInit {

  @ViewChild('RegisterGroundForm') tForm: NgForm;

  cities = ['Ghaziabad'];
  contractFileName: any;
  contractFile$: File = null;
  days = MatchConstants.DAYS_LIST;
  dayArrayMap = new Map<string, number>();
  doIt: boolean;
  groundAdded: boolean;
  groundTypes = ['public', 'private'];
  groundForm: FormGroup = new FormGroup({});
  hours: number[] = MatchConstants.GROUND_HOURS;
  imgUploadFile$: File = null;
  isLoading = false;
  isSubmitted = false;
  states = ['Uttar Pradesh'];
  timingsForm: FormGroup = new FormGroup({});
  timingsPreferences = {};
  timingsArray: any[] = [];
  totalHours: number;

  constructor(
    private ngStorage: AngularFireStorage,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.groundForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9 _-]*$'),
        Validators.maxLength(50),
      ]),
      imgpath: new FormControl(MatchConstantsSecondary.DEFAULT_IMAGE_URL),
      type: new FormControl('public', Validators.required),
      locState: new FormControl(null, Validators.required),
      locCity: new FormControl(null, Validators.required),
      contractFilePath: new FormControl(null),
      contractStartDate: new FormControl(today, Validators.required),
      contractEndDate: new FormControl(null, Validators.required),
    });
    this.dayArrayMap.set('Sun', 0);
    this.dayArrayMap.set('Mon', 1);
    this.dayArrayMap.set('Tues', 2);
    this.dayArrayMap.set('Wed', 3);
    this.dayArrayMap.set('Thurs', 4);
    this.dayArrayMap.set('Fri', 5);
    this.dayArrayMap.set('Sat', 6);
    this.timingsPreferences = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], };
  }

  onSelectImageUpload($event: File) {
    this.imgUploadFile$ = $event;
  }

  onSelectFileUpload(ev: File) {
    this.contractFileName = ev.name;
    this.contractFile$ = ev;
  }

  async onSubmitDetails() {
    if (this.isSubmitDisabled) {
      return;
    }
    this.isLoading = true;
    const uploadSnap1 = (await this.ngStorage.upload(
      '/groundImages/' + Math.random() + this.imgUploadFile$.name,
      this.imgUploadFile$
    )).ref.getDownloadURL();
    const uploadSnap2 = (await this.ngStorage.upload(
      '/groundContracts/' + Math.random() + this.contractFile$.name,
      this.contractFile$
    )).ref.getDownloadURL();
    const allPromises = [uploadSnap1, uploadSnap2];
    Promise.all(allPromises).then(paths => {
      this.groundForm.patchValue({
        imgpath: paths[0],
        contractFilePath: paths[1],
      });
      this.saveFormToServer();
    });
  }

  saveFormToServer() {
    for (const key in this.timingsPreferences) {
      if (this.timingsPreferences[key]) {
        const dayTimings = this.timingsPreferences[key] as number[];
        if (dayTimings.length === 0) {
          delete this.timingsPreferences[key];
        } else {
          this.timingsPreferences[key] = dayTimings.sort((a, b) => a - b);
        }
      }
    }
    const newGroundId = this.ngFire.createId();
    const newGround: GroundBasicInfo = {
      name: this.groundForm.value.name,
      imgpath: this.groundForm.value.imgpath,
      locState: this.groundForm.value.locState,
      locCity: this.groundForm.value.locCity,
      fieldType: 'TURF',
      ownType: this.groundForm.value.type === 'public' ? 'PUBLIC' : 'PRIVATE',
      playLvl: 'best',
    };
    const privateInfo: GroundPrivateInfo = {
      name: this.groundForm.value.name,
      signedContractFileLink: this.groundForm.value.contractFilePath,
      locState: this.groundForm.value.locState,
      locCity: this.groundForm.value.locCity,
      contractStartDate: new Date(this.groundForm.value.contractStartDate).getTime(),
      contractEndDate: new Date(this.groundForm.value.contractEndDate).getTime(),
      timings: this.timingsPreferences
    };
    const allPromises = [];
    allPromises.push(this.ngFire.collection('grounds').doc(newGroundId).set(newGround));
    allPromises.push(this.ngFire.collection('groundsPvt').doc(newGroundId).set(privateInfo));
    Promise.all(allPromises).then(() => {
      this.isLoading = false;
      this.snackServ.displayCustomMsg('Ground added successfully!');
      this.imgUploadFile$ = null;
      this.contractFile$ = null;
      // this.router.navigate(['/grounds', 'more', newGroundId])
      this.router.navigate(['/seasons']);
    });
  }

  isSelected(day: string, hour: number): boolean {
    const dayStr = this.dayArrayMap.get(day);
    return (this.timingsPreferences[dayStr] && (this.timingsPreferences[dayStr].findIndex(val => val === hour) > -1));
  }
  onSelectBox(day: string, hour: number): void {
    const dayStr = this.dayArrayMap.get(day);
    const index = (this.timingsPreferences[dayStr] as any[]).findIndex(val => val === hour);
    if (this.timingsPreferences[dayStr] && index === -1) {
      (this.timingsPreferences[dayStr] as any[]).push(hour);
    } else {
      (this.timingsPreferences[dayStr] as any[]).splice(index, 1);
    }
  }
  get isSubmitDisabled(): boolean {
    return (!this.groundForm.valid
      || !this.groundForm.dirty
      || this.isLoading
      || !(Object.values(this.timingsPreferences).some((val: any[]) => val.length))
      || !this.imgUploadFile$
      || !this.contractFile$);
  }
}
