import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  SeasonAbout,
  SeasonBasicInfo,
} from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-add-season',
  templateUrl: './add-season.component.html',
  styleUrls: ['./add-season.component.css'],
})
export class AddSeasonComponent implements OnInit {
  seasonForm: FormGroup = new FormGroup({});
  // cont_tour = new FormControl();
  defaultImage =
    'https://images.unsplash.com/photo-1516676324900-a8c0c01caa33?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
  cities = ['Ghaziabad'];
  states = ['Uttar Pradesh'];
  imgUpload: File;
  constructor(
    private ngStorage: AngularFireStorage,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {}

  ngOnInit(): void {
    this.seasonForm = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[A-Za-z0-9 _-]*$'),
        Validators.maxLength(50),
      ]),
      imgpath: new FormControl(this.defaultImage),
      locCity: new FormControl(null, Validators.required),
      locState: new FormControl(null, Validators.required),
      cont_tour: new FormControl(null, Validators.required),
      desc: new FormControl(null, [
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
  async onSubmit() {
    console.log(this.seasonForm);
    let uploadSnap = await this.ngStorage.upload(
      '/seasonImages' + Math.random() + this.imgUpload.name,
      this.imgUpload
    );
    uploadSnap.ref.getDownloadURL().then((path) => {
      this.seasonForm.patchValue({
        imgpath: path,
      });
      this.saveFormToServer(this.seasonForm.value);
    });
  }
  saveFormToServer(formData: {}) {
    console.log(this.seasonForm);
    const newSeasonId = this.ngFire.createId();
    const newSeason: SeasonBasicInfo = {
      name: formData['name'],
      imgpath: formData['imgpath'],
      locCity: formData['locCity'],
      locState: formData['locState'],
      premium: formData['premium'],
      start_date: new Date(),
      cont_tour: formData['cont_tour'],
      id: newSeasonId,
    };
    const newSeasonMore: SeasonAbout = {
      description: formData['desc'],
      rules: formData['rules'],
      paymentMethod: formData['paymentMethod'],
    };
    let AllPromises = [];
    AllPromises.push(
      this.ngFire.collection('seasons').doc(newSeason.id).set(newSeason)
    );
    AllPromises.push(
      this.ngFire
        .collection('seasons')
        .doc(newSeason.id)
        .collection('additionalInfo')
        .doc('moreInfo')
        .set(newSeasonMore)
    );
    Promise.all(AllPromises).then(() => {
      this.snackServ.displayCustomMsg('Season added successfully!');
      this.seasonForm.reset();
    });
  }
  onAutofill() {
    this.seasonForm.setValue({
      name: 'Freekyk Football Season',
      imgpath: this.defaultImage,
      locCity: 'Ghaziabad',
      locState: 'Uttar Pradesh',
      cont_tour: ['FKC', 'FPL', 'FCP'],
      desc: 'this is a dummy description',
      rules: 'these are dummy rules',
      paymentMethod: 'Online',
      premium: true,
    });
    this.saveFormToServer(this.seasonForm.value);
  }
  onBrowsePhoto(file: any) {
    this.imgUpload = file.target.files[0];
  }
}
