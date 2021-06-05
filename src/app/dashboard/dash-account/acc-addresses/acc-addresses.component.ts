import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { userAddress } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-acc-addresses',
  templateUrl: './acc-addresses.component.html',
  styleUrls: ['./acc-addresses.component.css'],
})
export class AccAddressesComponent implements OnInit {
  noSavedAddress: boolean = false;
  newAddressForm: FormGroup = new FormGroup({});
  addr$: Observable<userAddress[]>;
  additionAvailable = true;
  showForm = false;
  cities = ['Ghaziabad'];
  states = ['Uttar Pradesh'];
  countries = ['India'];

  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore
  ) {}

  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    this.getAddresses();
  }
  getAddresses() {
    const uid = localStorage.getItem('uid');
    this.addr$ = this.ngFire
      .collection('players/' + uid + '/Addresses')
      .snapshotChanges()
      .pipe(
        tap((resp) => (this.noSavedAddress = resp.length == 0)),
        map((resp) =>
          resp.map(
            (doc) =>
              <userAddress>{
                id: doc.payload.doc.id,
                ...(<userAddress>doc.payload.doc.data()),
              }
          )
        )
      );
  }
  onOpenAddressForm() {
    this.additionAvailable = false;
    this.showForm = true;
    this.newAddressForm = new FormGroup({
      addr_name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
      ]),
      addr_line1: new FormControl(null, Validators.required),
      addr_line2: new FormControl(null),
      landmark: new FormControl(null),
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      pincode: new FormControl(
        null,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(6),
          Validators.minLength(6),
        ],
        this.FirstDigitNotZero.bind(this)
      ),
      ph_numb: new FormControl(
        null,
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
        this.FirstDigitNotZero.bind(this)
      ),
    });
  }
  onDeleteAddress(formid: string) {
    // backend code goes here
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection('players/' + uid + '/Addresses')
      .doc(formid)
      .delete()
      .then(() => this.snackServ.displayDelete());
  }
  resetAll() {
    this.additionAvailable = true;
    this.showForm = false;
  }
  onSaveAddress() {
    // backend code goes here
    console.log(this.newAddressForm);
    const uid = localStorage.getItem('uid');
    this.ngFire
      .collection('players/' + uid + '/Addresses')
      .add(this.newAddressForm.value)
      .then(this.finishSubmit.bind(this));
  }
  finishSubmit() {
    this.snackServ.displayCustomMsg('Address saved successfully!');
    this.resetAll();
  }
  FirstDigitNotZero(control: AbstractControl) {
    return (<string>control.value).charAt(0) == '0'
      ? of({ invalidCode: true })
      : of(null);
  }
}
