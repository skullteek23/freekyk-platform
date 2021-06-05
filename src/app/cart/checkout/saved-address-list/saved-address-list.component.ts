import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSelectionListChange } from '@angular/material/list';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CheckoutService } from 'src/app/services/checkout.service';
import { userAddress } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-saved-address-list',
  templateUrl: './saved-address-list.component.html',
  styleUrls: ['./saved-address-list.component.css'],
})
export class SavedAddressListComponent implements OnInit {
  addresses$: Observable<userAddress[]>;
  noAddr: boolean;
  constructor(
    private ngFire: AngularFirestore,
    private checkoutServ: CheckoutService
  ) {}
  ngOnInit(): void {
    const uid = localStorage.getItem('uid');
    this.addresses$ = this.ngFire
      .collection(`players/${uid}/Addresses`)
      .get()
      .pipe(
        tap((resp) => (this.noAddr = resp.empty)),
        map((resp) =>
          resp.docs.map(
            (doc) => <userAddress>{ id: doc.id, ...(<userAddress>doc.data()) }
          )
        )
      );
  }
  onSelectAddress(list: MatSelectionListChange) {
    this.checkoutServ.setDelAddr(<userAddress>list.options[0].value);
  }
}
