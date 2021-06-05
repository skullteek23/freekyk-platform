import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { VEProject } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-ve-project',
  templateUrl: './ve-project.component.html',
  styleUrls: ['./ve-project.component.css'],
})
export class VeProjectComponent implements OnInit {
  projectForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<VeProjectComponent>,
    private ngFire: AngularFirestore,
    private snackServ: SnackbarService
  ) {
    this.projectForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      phone: new FormControl(null, Validators.required),
      desc: new FormControl(null, Validators.required),
      musicSel: new FormControl(null, Validators.required),
      dur: new FormControl(null, Validators.required),
      raw_dur: new FormControl(null, Validators.required),
      delivery: new FormControl(null, Validators.required),
      raw_videos: new FormArray([new FormControl(null, Validators.required)]),
      photos: new FormArray([new FormControl(null)]),
    });
  }
  onAddControl() {
    const fmCtrl = new FormControl(null, Validators.required);
    (<FormArray>this.projectForm.get('raw_videos')).push(fmCtrl);
  }
  onRemoveControl(index: number) {
    (<FormArray>this.projectForm.get('raw_videos')).removeAt(index);
  }
  getFormArray() {
    return (<FormArray>this.projectForm.get('raw_videos')).controls;
  }

  onFormComplete() {
    console.log(this.projectForm);
    this.ngFire
      .collection('projectsVE')
      .add(<VEProject>this.projectForm.value)
      .then(() => {
        this.snackServ.displayCustomMsg(
          'Project submitted! You will hear from us soon.'
        );
        this.onCloseDialog();
      });
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  ngOnInit(): void {}
}
