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
import { RegexPatterns } from '@shared/Constants/REGEX';

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
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
    private locationServ: LocationService
  ) { }

  ngOnInit(): void {
    this.uid = localStorage.getItem('uid');
    this.getAddresses();
    this.onGetStates();
  }
  onGetStates(): void {
    this.states$ = this.locationServ.getStateByCountry();
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
        Validators.pattern(RegexPatterns.alphaNumberWithSpace),
      ]),
      addr_line1: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.query)]),
      addr_line2: new FormControl(null, Validators.pattern(RegexPatterns.query)),
      landmark: new FormControl(null, Validators.pattern(RegexPatterns.query)),
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      pincode: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.pincode)]),
      ph_numb: new FormControl(null, [Validators.required, Validators.pattern(RegexPatterns.phoneNumber)]),
    });
  }
  onDeleteAddress(formid: string): void {
    this.ngFire
      .collection(`players/${this.uid}/Addresses`)
      .doc(formid)
      .delete()
      .then(() => this.snackBarService.displayCustomMsg('Address deleted successfully!'))
      .catch(() => this.snackBarService.displayError());
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
      .then(this.finishSubmit.bind(this))
      .catch(() => this.snackBarService.displayError());
  }
  finishSubmit(): void {
    this.snackBarService.displayCustomMsg('Address saved successfully!');
    this.resetAll();
  }
  FirstDigitNotZero(control: AbstractControl): Observable<any> {
    return (control.value as string).charAt(0) === '0'
      ? of({ invalidCode: true })
      : of(null);
  }
}
