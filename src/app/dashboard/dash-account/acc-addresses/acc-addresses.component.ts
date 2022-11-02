import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocationService } from '@shared/services/location-cities.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { userAddress } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-acc-addresses',
  templateUrl: './acc-addresses.component.html',
  styleUrls: ['./acc-addresses.component.scss'],
})
export class AccAddressesComponent implements OnInit {
  noSavedAddress = false;
  newAddressForm: FormGroup = new FormGroup({});
  addr$: Observable<userAddress[]>;
  additionAvailable = true;
  showForm = false;
  cities$: Observable<string[]>;
  states$: Observable<string[]>;
  uid: string;

  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private locationServ: LocationService
  ) { }

  ngOnInit(): void {
    this.uid = localStorage.getItem('uid');
    this.getAddresses();
    this.onGetStates();
  }
  onGetStates(): void {
    this.states$ = this.locationServ.getStateByCountry('India');
  }
  onSelectState(state: MatSelectChange): void {
    this.cities$ = this.locationServ.getCityByState(state.value);
  }
  getAddresses(): void {
    this.addr$ = this.ngFire
      .collection(`players/${this.uid}/Addresses`)
      .snapshotChanges()
      .pipe(
        tap((resp) => (this.noSavedAddress = resp.length === 0)),
        map((resp) =>
          resp.map(
            (doc) =>
            ({
              id: doc.payload.doc.id,
              ...(doc.payload.doc.data() as userAddress),
            } as userAddress)
          )
        )
      );
  }
  onOpenAddressForm(): void {
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
  onDeleteAddress(formid: string): void {
    this.ngFire
      .collection(`players/${this.uid}/Addresses`)
      .doc(formid)
      .delete()
      .then(() => this.snackServ.displayCustomMsg('Address deleted successfully!'));
  }
  resetAll(): void {
    this.additionAvailable = true;
    this.showForm = false;
  }
  onSaveAddress(): void {
    // console.log(this.newAddressForm);
    this.ngFire
      .collection(`players/${this.uid}/Addresses`)
      .add(this.newAddressForm.value)
      .then(this.finishSubmit.bind(this));
  }
  finishSubmit(): void {
    this.snackServ.displayCustomMsg('Address saved successfully!');
    this.resetAll();
  }
  FirstDigitNotZero(control: AbstractControl): Observable<any> {
    return (control.value as string).charAt(0) === '0'
      ? of({ invalidCode: true })
      : of(null);
  }
}
