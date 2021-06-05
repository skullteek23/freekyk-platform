import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CARD,
  NETBANKING,
  OrderAdditionalDetails,
  OrderBasic,
  UPI,
} from '../shared/interfaces/order.model';
import { cartItem, coupon } from '../shared/interfaces/product.model';
import { SnackbarService } from './snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutComponent } from '../cart/checkout/checkout.component';
import { userAddress } from '../shared/interfaces/others.model';
import firebase from 'firebase/app';
@Injectable({
  providedIn: 'root',
})
export class CartService implements OnDestroy {
  private cart: cartItem[] = [];
  private delCharges: number = 50;
  private subTotalPrice: number = 0;
  private discount: number = 0;
  subtotalPriceChanged = new BehaviorSubject<number>(0);
  totalDiscountChanged = new BehaviorSubject<number>(0);
  cartItemsChanged = new BehaviorSubject<cartItem[]>([]);
  getCartItems() {
    return this.cart.slice();
  }
  getDelCharges() {
    return this.delCharges;
  }
  onAddItemToCart(newItem: cartItem) {
    this.addItem(newItem);
    this.afterCartOp();
    this.snackServ.displayCustomMsg('Item added to cart!');
    this.changePrice();
    this.router.navigate(['/cart']);
  }
  onDeleteItemFromCart(delItemId: string) {
    this.cart.splice(
      this.cart.findIndex((item) => item.prodId == delItemId),
      1
    );
    this.afterCartOp();
    this.snackServ.displayCustomMsg('Item removed from cart!');
    this.changePrice();
  }
  private changePrice() {
    this.subTotalPrice = this.cart.reduce((sum, itemPrice) => {
      return sum + +itemPrice.prodPrice;
    }, 0);
    this.subtotalPriceChanged.next(this.subTotalPrice);
    localStorage.setItem('totalPrice', JSON.stringify(this.subTotalPrice));
    if (this.subTotalPrice == 0) localStorage.removeItem('discount');
    let coupon = <coupon>JSON.parse(localStorage.getItem('coupon'));
    if (!!coupon && coupon.type == 'discount in percentage') {
      const newDiscount =
        (coupon.discount / 100) * (this.subTotalPrice + this.delCharges);
      localStorage.setItem('discount', JSON.stringify(newDiscount));
      this.discount = newDiscount;
      this.totalDiscountChanged.next(newDiscount);
    }
  }
  private addItem(newItem: cartItem) {
    this.cart.push(newItem);
  }
  private afterCartOp() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.cartItemsChanged.next(this.cart);
  }

  getCoupons() {
    return this.ngFire
      .collection('coupons')
      .get()
      .pipe(map((resp) => resp.docs.map((doc) => <coupon>doc.data())));
  }
  onApplyCoupon(coupon: coupon) {
    const dis = JSON.parse(localStorage.getItem('discount'));
    if (!!dis == false && this.cart.length > 0) {
      if (coupon.type == 'discount in exact amount') {
        this.discount = coupon.discount;
        this.totalDiscountChanged.next(coupon.discount);
        localStorage.setItem('discount', JSON.stringify(coupon.discount));
      } else if (coupon.type == 'discount in percentage') {
        const amount =
          (coupon.discount / 100) * (this.subTotalPrice + this.delCharges);
        this.discount = amount;
        this.totalDiscountChanged.next(amount);
        localStorage.setItem('discount', JSON.stringify(amount));
        localStorage.setItem('coupon', JSON.stringify(coupon));
      }
      this.snackServ.displayApplied();
    } else this.snackServ.displayCustomMsg('Coupon already applied!');
  }
  onCheckout() {
    this.dialog
      .open(CheckoutComponent, {
        panelClass: 'large-dialogs',
        data: this.cart,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data: userAddress) => {
        if (!!data) {
          //payment page integration
          //payment API call
          //recieve payment Id, order Id & payment Method
          alert('Click to Complete Payment!');
          let paymentId = 'RZPY#1234';
          let orderId = 'OD#1234';
          let paymentMethod: CARD | UPI | NETBANKING = 'payment with upi';
          this.snackServ.displayCustomMsg('Payment Recieved Successfully!');

          const oDocId = this.ngFire.createId();
          const uid = localStorage.getItem('uid');
          const order: OrderBasic = {
            orderedByUID: uid,
            orderStatus: 'order is placed',
            total: this.subTotalPrice + this.delCharges - this.discount,
            placedOn: firebase.firestore.Timestamp.fromDate(new Date()),
            prodCount: this.cart.length,
            lastProduct: this.cart[this.cart.length - 1],
            paymentId: paymentId,
            order_ID: uid + paymentId,
          };
          const orderAddi: OrderAdditionalDetails = {
            dateAdded: firebase.firestore.Timestamp.fromDate(new Date()),
            phoneNum: +data.ph_numb,
            addressId: data.id,
            paymentMethod: paymentMethod,
            OID: uid + paymentId,
          };
          let allPromises = [];
          allPromises.push(
            this.ngFire.collection('orders').doc(oDocId).set(order)
          );
          allPromises.push(
            this.ngFire
              .collection(`orders/${oDocId}/additionalInfo`)
              .doc('orderDetails')
              .set(orderAddi)
          );

          Promise.all(allPromises).then(() => {
            this.router.navigate(['/dashboard/account/orders']);
          });
        }
      });
  }

  ngOnDestroy() {
    localStorage.setItem(JSON.stringify(this.cart), 'cart');
  }
  constructor(
    private snackServ: SnackbarService,
    private ngFire: AngularFirestore,
    private router: Router,
    private dialog: MatDialog
  ) {
    const tempCart = <cartItem[]>JSON.parse(localStorage.getItem('cart'));
    const tempSubTotal = <number>JSON.parse(localStorage.getItem('totalPrice'));
    const tempDiscount = <number>JSON.parse(localStorage.getItem('discount'));
    if (!!tempCart && !!tempSubTotal) {
      this.cart = tempCart;
      this.subTotalPrice = tempSubTotal;
      this.subtotalPriceChanged.next(this.subTotalPrice);
      this.cartItemsChanged.next(this.cart);
      if (!!tempDiscount) this.totalDiscountChanged.next(tempDiscount);
    }
  }
}
