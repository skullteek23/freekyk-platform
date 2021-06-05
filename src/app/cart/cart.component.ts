import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, share, shareReplay, startWith } from 'rxjs/operators';
import { CartService } from '../services/cart.service';
import { cartItem, coupon } from '../shared/interfaces/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  couponInput: FormGroup;
  cartItems$: Observable<cartItem[]>;
  delCharges: number = 0;
  subtotalPriceChanged$: Observable<number>;
  currDiscount$: Observable<number>;
  constructor(private cartServ: CartService, private ngFire: AngularFirestore) {
    this.couponInput = new FormGroup({
      code: new FormControl(
        null,
        [Validators.required, Validators.pattern(/^[0-9a-zA-Z ]+$/)],
        this.validateCouponValid.bind(this)
      ),
    });
  }
  ngOnInit(): void {
    this.cartItems$ = this.cartServ.cartItemsChanged.pipe(shareReplay());
    this.delCharges = this.cartServ.getDelCharges();
    this.subtotalPriceChanged$ = this.cartServ.subtotalPriceChanged.pipe(
      shareReplay()
    );
    this.currDiscount$ = this.cartServ.totalDiscountChanged.pipe(shareReplay());
  }
  onCheckout() {
    this.cartServ.onCheckout();
  }

  onApplyCoupon() {
    this.ngFire
      .collection('coupons', (query) =>
        query.where('code', '==', this.couponInput.value['code'])
      )
      .get()
      .pipe(
        map((responseData) => {
          if (!!responseData) {
            return <coupon>responseData.docs[0]?.data();
          }
        })
      )
      .subscribe((coupon) => {
        this.cartServ.onApplyCoupon(coupon);
        this.couponInput.reset();
      });
  }
  validateCouponValid(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.ngFire
      .collection('coupons', (query) =>
        query.where('code', '==', control.value)
      )
      .get()
      .pipe(
        map((responseData) => {
          if (!responseData.empty) return null;
          else return { invalidCoupon: true };
        })
      );
  }
  onDeleteItem(itemId: string) {
    this.cartServ.onDeleteItemFromCart(itemId);
  }
  onAddSimilarItem(item: cartItem) {
    this.cartServ.onAddItemToCart(item);
  }
}
