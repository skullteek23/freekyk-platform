import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { iif, merge, Observable, of } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { CheckoutService } from 'src/app/services/checkout.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { userAddress } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-fill-address',
  templateUrl: './fill-address.component.html',
  styleUrls: ['./fill-address.component.css'],
})
export class FillAddressComponent implements OnInit, AfterViewInit {
  @ViewChild('check', { static: false }) saveAddress: MatCheckbox;
  @ViewChild('newName', { static: false }) newNameAddr: ElementRef;
  @Input() allowAddNew = false;
  disabledButton: Observable<boolean>;
  newAddressForm: FormGroup;
  addrName: string;
  cities: string[] = ['Ghaziabad'];
  states: string[] = ['Uttar Pradesh'];
  constructor(
    private checkoutServ: CheckoutService,
    private ngFire: AngularFirestore
  ) {
    this.newAddressForm = new FormGroup({
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

  ngOnInit(): void {}
  ngAfterViewInit() {
    console.log();
    this.disabledButton = this.saveAddress.change.pipe(
      map((check) => {
        if (check.checked) return !!this.newNameAddr.nativeElement.value;
        return true;
      })
    );
  }
  onSubmit() {
    let addrId = this.ngFire.createId();
    this.checkoutServ.setDelAddr({
      id: addrId,
      ...(<userAddress>this.newAddressForm.value),
    });
    if (this.saveAddress.checked && !!this.newNameAddr.nativeElement.value) {
      this.checkoutServ.saveAddressToSever(<userAddress>{
        addr_name: this.newNameAddr.nativeElement.value,
        ...(<userAddress>this.newAddressForm.value),
      });
    }
    this.newAddressForm.reset();
  }
  onCloseDialog() {}
  FirstDigitNotZero(control: AbstractControl) {
    return (<string>control.value).charAt(0) == '0'
      ? of({ invalidCode: true })
      : of(null);
  }
}
