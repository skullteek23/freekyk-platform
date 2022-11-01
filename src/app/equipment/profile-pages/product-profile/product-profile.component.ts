import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import {
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
  isLoading = true;
  selectedSize = -1;
  prodId: string;
  imgPath: string;
  disableButton = true;
  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private enlServ: EnlargeService,
    private router: Router
  ) {
    const uid = localStorage.getItem('uid');
    this.disableButton = !!uid === false;
  }
  ngOnInit(): void {
    this.prodId = this.route.snapshot.params.productid;
    this.getProdBasicInfo();
  }
  getProdBasicInfo(): void {
    this.prodInfo$ = this.ngFire
      .collection('products')
      .doc(this.prodId)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getProdAddiInfo();
            this.imgPath = (resp.data() as ProdBasicInfo).imgpath;
          } else {this.router.navigate(['/error']);}
        }),
        map((resp) => resp.data() as ProdBasicInfo),
        share()
      );
  }
  getProdAddiInfo(): void {
    this.prodMoreInfo$ = this.ngFire
      .collection(`products/${this.prodId}/additionalInfo`)
      .doc('specifications')
      .get()
      .pipe(
        tap(() => (this.isLoading = false)),
        map((resp) => resp.data() as ProdMoreInfo),
        share()
      );
  }
  onAddToCart(): void {
    // cart code here
  }
  onSelectSize(size: number): void {
    this.selectedSize = size;
  }
  onEnlargePhoto(): void {
    this.enlServ.onOpenPhoto(this.imgPath);
  }
}
