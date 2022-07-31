import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SeasonAbout, SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';
import { PhotoUploaderComponent } from '../../shared/components/photo-uploader/photo-uploader.component';
import { MatchConstants } from '../../shared/constants/constants';

@Component({
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.css'],
})
export class AddSeasonComponent implements OnInit {
  seasonForm: FormGroup = new FormGroup({});
  seasonName = '';
  defaultImage =
    'https://images.unsplash.com/photo-1516676324900-a8c0c01caa33?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  cities = ['Ghaziabad'];
  states = ['Uttar Pradesh'];
  $imgUpload: File = null;
  teamsList = MatchConstants.ALLOWED_PARTICIPATION_COUNT;
  tourTypes = MatchConstants.MATCH_TYPES;
  tourTypesFiltered = MatchConstants.MATCH_TYPES;
  todayDate = new Date();
  isLoading = false;
  newSeasonId: string = null;
  isEditMode = false;

  @ViewChild(PhotoUploaderComponent) photoUploaderComponent: PhotoUploaderComponent;

  constructor(
    private ngStorage: AngularFireStorage,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const params = this.route.snapshot.params;
    const qParams = this.route.snapshot.queryParams;
    if (qParams && qParams.hasOwnProperty('name')) {
      this.seasonName = qParams.name;
    }
    if (params.hasOwnProperty('sid') && window.location.href.includes('edit') && params.sid) {
      this.isEditMode = true;
      this.isLoading = true;
      this.newSeasonId = params.sid;

      forkJoin([ngFire.collection('seasons').doc(this.newSeasonId).get(), ngFire.collection(`seasons/${this.newSeasonId}/additionalInfo`).doc('moreInfo').get()]).subscribe((response => {
        const data = response[0].data() as SeasonBasicInfo;
        const moreData = response[1].data() as SeasonAbout;
        this.initFormWithValues(data, moreData);
        this.isLoading = false;
      }))
    } else {
      this.isEditMode = false;
      this.newSeasonId = null;
      this.initForm();
    }
  }

  ngOnInit(): void {
  }

  initForm() {
    this.seasonForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9 _-]*$'),
        Validators.maxLength(50),
      ]),
      imgpath: new FormControl(this.defaultImage),
      locCity: new FormControl(null, Validators.required),
      locState: new FormControl(null, Validators.required),
      p_teams: new FormControl(null, Validators.required),
      start_date: new FormControl(null, Validators.required),
      cont_tour: new FormControl(null, Validators.required),
      description: new FormControl(null, [
        Validators.required,
        Validators.maxLength(300),
      ]),
      rules: new FormControl(null, [
        Validators.required,
        Validators.maxLength(300),
      ]),
      paymentMethod: new FormControl('Online'),
      premium: new FormControl(true),
    });
  }

  initFormWithValues(data: SeasonBasicInfo, moreData: SeasonAbout) {
    data['start_date_toDate'] = new Date(data.start_date['seconds'] * 1000)
    this.seasonForm = new FormGroup({
      name: new FormControl(data.name, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9 _-]*$'),
        Validators.maxLength(50),
      ]),
      imgpath: new FormControl(data.imgpath),
      locCity: new FormControl(data.locCity, Validators.required),
      locState: new FormControl(data.locState, Validators.required),
      p_teams: new FormControl(data.p_teams, Validators.required),
      start_date: new FormControl(data['start_date_toDate'], Validators.required),
      cont_tour: new FormControl(data.cont_tour, Validators.required),
      description: new FormControl(moreData.description, [
        Validators.required,
        Validators.maxLength(300),
      ]),
      rules: new FormControl(moreData.rules, [
        Validators.required,
        Validators.maxLength(300),
      ]),
      paymentMethod: new FormControl('Online'),
      premium: new FormControl(true),
    });
  }

  onGetImage(event) {
    this.$imgUpload = event;
  }

  async onSubmit() {
    if (this.seasonForm.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.newSeasonId && this.isEditMode) {
      this.updateInfo(this.seasonForm)
      return;
    }
    let uploadSnap = await this.ngStorage.upload(
      '/seasonImages/' + Math.random() + this.$imgUpload.name,
      this.$imgUpload
    );
    uploadSnap.ref.getDownloadURL().then((path) => {
      this.seasonForm.patchValue({
        imgpath: path,
      });
      this.saveFormToServer(this.seasonForm.value);
    });
  }
  onRestrictTournamentTypes(event: MatSelectChange) {
    this.tourTypesFiltered = [];
    this.seasonForm.get('cont_tour').reset();
    this.tourTypesFiltered.push('FCP');
    if (event.value % 4 === 0) {
      this.tourTypesFiltered.push('FKC');
    }
    if (event.value > 2) {
      this.tourTypesFiltered.push('FPL');
    }
  }
  saveFormToServer(formData) {
    const newSeasonId = this.ngFire.createId();
    const newSeason: SeasonBasicInfo = {
      name: formData['name'],
      imgpath: formData['imgpath'],
      locCity: formData['locCity'],
      locState: formData['locState'],
      premium: formData['premium'],
      p_teams: formData['p_teams'],
      start_date: formData['start_date'],
      isSeasonStarted: false,
      cont_tour: formData['cont_tour'],
      id: newSeasonId,
    };
    const newSeasonMore: SeasonAbout = {
      description: formData['description'],
      rules: formData['rules'],
      paymentMethod: formData['paymentMethod'],
    };
    let AllPromises = [];
    AllPromises.push(
      this.ngFire.collection('seasons').doc(newSeasonId).set(newSeason)
    );
    AllPromises.push(
      this.ngFire
        .collection('seasons')
        .doc(newSeasonId)
        .collection('additionalInfo')
        .doc('moreInfo')
        .set(newSeasonMore)
    );
    Promise.all(AllPromises).then(() => {
      this.isLoading = false;
      this.snackServ.displayCustomMsg('Season added successfully!');
      this.$imgUpload = null;
      this.initForm();
      if (this.photoUploaderComponent) {
        this.photoUploaderComponent.resetImage();
      }
      this.router.navigate(['/seasons', 'fixtures', newSeasonId], { queryParams: { name: newSeason.name } })
    });
  }
  updateInfo(form: FormGroup) {
    const formData = form.value;
    const newSeasonId = this.newSeasonId;
    const newSeason = {
      isSeasonStarted: false,
      id: newSeasonId,
    }
    const newSeasonMore = {};
    for (const controlVal in form.controls) {
      const control = form.get(controlVal);
      if (control.dirty && control.valid) {
        if (controlVal === 'description' || controlVal === 'rules' || controlVal === 'paymentMethod') {
          newSeasonMore[controlVal] = formData[controlVal];
        } else {
          newSeason[controlVal] = formData[controlVal];
        }
      }
    }
    let AllPromises = [];
    if (Object.keys(newSeason).length > 2) {
      AllPromises.push(
        this.ngFire.collection('seasons').doc(newSeasonId).update(newSeason)
      );
    }
    if (Object.keys(newSeasonMore).length) {
      AllPromises.push(
        this.ngFire
          .collection('seasons')
          .doc(newSeasonId)
          .collection('additionalInfo')
          .doc('moreInfo')
          .update(newSeasonMore)
      );
    }
    if (AllPromises.length) {
      Promise.all(AllPromises).then(() => {
        this.isLoading = false;
        this.snackServ.displayCustomMsg('Season updated successfully!');
        this.$imgUpload = null;
        this.initForm();
        if (this.photoUploaderComponent) {
          this.photoUploaderComponent.resetImage();
        }
        this.router.navigate(['/seasons'])
      });
    }
  }
}
