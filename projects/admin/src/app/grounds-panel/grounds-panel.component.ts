import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  GroundBasicInfo,
  GroundMoreInfo,
} from 'src/app/shared/interfaces/ground.model';

import firebase from 'firebase/app';
import {
  NgForm,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
@Component({
  selector: 'app-grounds-panel',
  templateUrl: './grounds-panel.component.html',
  styleUrls: ['./grounds-panel.component.css'],
})
export class GroundsPanelComponent implements OnInit {
  @ViewChild('RegisterGroundForm') tForm: NgForm;
  Rform: FormGroup;
  totalHours: number;
  doIt: boolean;
  isSubmitted;
  err;
  groundAdded: boolean;
  allTimingSlot_array: string[] = [
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
  ];
  days_array = [
    {
      day_name: 'Sunday',
      day_num: '0',
    },
    {
      day_name: 'Monday',
      day_num: '1',
    },
    {
      day_name: 'Tuesday',
      day_num: '2',
    },
    {
      day_name: 'Wednesday',
      day_num: '3',
    },
    {
      day_name: 'Thursday',
      day_num: '4',
    },
    {
      day_name: 'Friday',
      day_num: '5',
    },
    {
      day_name: 'Saturday',
      day_num: '6',
    },
  ];
  statesInfo = [];
  cityInfo = [];
  constructor(private ngfirestore: AngularFirestore) {
    this.Rform = new FormGroup({
      0: new FormArray([]),
      1: new FormArray([]),
      2: new FormArray([]),
      3: new FormArray([]),
      4: new FormArray([]),
      5: new FormArray([]),
      6: new FormArray([]),
    });
  }

  onAddPreference(day: string, timeSlot: string) {
    const control = new FormControl(timeSlot, Validators.required);
    const array_in_action = <FormArray>this.Rform.get(day);

    array_in_action.push(control);
  }
  // onRemovePreference(day: string, timeSlot: string) {
  //   (<FormArray>this.Rform.get(day)).removeAt;
  // }
  onClearPreferences(day: string) {
    (<FormArray>this.Rform.get(day)).clear();
  }
  onClearAllPreferences() {
    this.days_array.forEach((day) => {
      (<FormArray>this.Rform.get(day.day_num)).clear();
    });
  }
  onSubmitForm(form: NgForm) {
    const newGroundsId = this.ngfirestore.createId();
    const newGroundData = {
      groundId: newGroundsId,
      groundName: form.value['groundName'],
      groundLocationState: form.value['groundLocationState'],
      groundLocationCity: form.value['groundLocationCity'],
      groundAvailability: true,
      groungType: form.value['groungType'],
      groundImgpath: form.value['groundImgpath'],
      groundCharges: form.value['groundCharges'],
      signedContractFileLink: form.value['signedContractFileLink'],
      contractstartdate: form.value['contractstartdate'],
      contractenddate: form.value['contractenddate'],
      groundRepresentative: {
        name: form.value['gname'],
        contactNumber: form.value['gcontactNumber'],
        email: form.value['gemail'],
        designation: form.value['gdesignation'],
      },
      freekykRepresentative: {
        name: form.value['fname'],
        contactNumber: form.value['fcontactNumber'],
        email: form.value['femail'],
        designation: form.value['fdesignation'],
      },
      timingsDetails: this.Rform.value,
      totalAvailableHours: this.totalHours,
    };
    // console.log(newGroundData);
    this.ngfirestore
      .collection('grounds')
      .doc(newGroundsId)
      .set(newGroundData)
      .then(() => {
        this.groundAdded = true;
        this.err = false;
        this.onClearForm();
      })
      .catch((error) => {
        console.log(error);
        this.err = true;
        this.groundAdded = false;
        this.onClearForm();
      });
  }
  getTimeSlot(timeSlot: string) {
    if (+timeSlot == 12) return timeSlot + ':00 PM';
    return +timeSlot > 12
      ? (+timeSlot - 12).toString() + ':00 PM'
      : timeSlot + ':00 AM';
  }
  onClearForm() {
    this.tForm.resetForm();
    this.Rform.reset();
    this.onClearAllPreferences();
  }
  ngOnInit(): void {
    this.statesInfo = ['Uttar Pradesh'];
    this.groundAdded = false;
  }
  onChangeState(stateValue) {
    this.cityInfo = ['Ghaziabad'];
  }
  getControls(day: string) {
    return (<FormArray>this.Rform.get(day)).controls;
  }
  onSubmitPreferences() {
    this.totalHours =
      (<FormArray>this.Rform.get('0')).length +
      (<FormArray>this.Rform.get('1')).length +
      (<FormArray>this.Rform.get('2')).length +
      (<FormArray>this.Rform.get('3')).length +
      (<FormArray>this.Rform.get('4')).length +
      (<FormArray>this.Rform.get('5')).length +
      (<FormArray>this.Rform.get('6')).length;
  }
}
