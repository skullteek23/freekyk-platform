import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { merge, Observable } from 'rxjs';
import { map, mergeMap, share, take, tap } from 'rxjs/operators';
import { CartService } from 'src/app/services/cart.service';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  cartItem,
  ProdBasicInfo,
  ProdMoreInfo,
} from 'src/app/shared/interfaces/product.model';

@Component({
  selector: 'app-product-profile',
  templateUrl: './product-profile.component.html',
  styleUrls: ['./product-profile.component.css'],
})
export class ProductProfileComponent implements OnInit {
  prodInfo$: Observable<ProdBasicInfo>;
  prodMoreInfo$: Observable<ProdMoreInfo>;
  isLoading: boolean = true;
  selectedSize: number = -1;
  prodId: string;
  imgPath: string;
  disableButton: boolean = true;
  constructor(
    private cartServ: CartService,
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private snackBarServ: SnackbarService,
    private enlServ: EnlargeService,
    private router: Router
  ) {
    const uid = localStorage.getItem('uid');
    this.disableButton = !!uid == false;
  }
  ngOnInit(): void {
    this.prodId = this.route.snapshot.params['productid'];
    this.getProdBasicInfo();
  }
  getProdBasicInfo() {
    this.prodInfo$ = this.ngFire
      .collection('products')
      .doc(this.prodId)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getProdAddiInfo();
            this.imgPath = (<ProdBasicInfo>resp.data()).imgpath;
          } else this.router.navigate(['/error']);
        }),
        map((resp) => <ProdBasicInfo>resp.data()),
        share()
      );
  }
  getProdAddiInfo() {
    this.prodMoreInfo$ = this.ngFire
      .collection(`products/${this.prodId}/additionalInfo`)
      .doc('specifications')
      .get()
      .pipe(
        tap(() => (this.isLoading = false)),
        map((resp) => <ProdMoreInfo>resp.data()),
        share()
      );
  }
  onAddToCart() {
    if (this.selectedSize == -1)
      this.snackBarServ.displayCustomMsg('Please select a size first!');
    else {
      this.prodInfo$
        .pipe(
          take(1),
          map(
            (resp) =>
              <cartItem>{
                prodId: this.prodId,
                prodImgpath: resp.imgpath,
                prodName: resp.name,
                prodPrice: resp.price,
              }
          )
        )
        .subscribe((data) => this.cartServ.onAddItemToCart(data));
    }
  }
  onSelectSize(size: number) {
    this.selectedSize = size;
  }
  onEnlargePhoto() {
    this.enlServ.onOpenPhoto(this.imgPath);
  }
}
