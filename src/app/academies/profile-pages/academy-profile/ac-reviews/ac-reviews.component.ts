import { Component, OnInit } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-ac-reviews',
  templateUrl: './ac-reviews.component.html',
  styleUrls: ['./ac-reviews.component.css'],
})
export class AcReviewsComponent implements OnInit {
  newReview: {} = {};
  disabletButton: boolean = true;
  isSelected = -1;
  isHovered = -1;
  stars = [0, 1, 2, 3, 4];
  constructor(private snackBarServ: SnackbarService) {}
  ngOnInit(): void {}
  onSubmitReview() {
    const uid = localStorage.getItem('uid');
    if (!!uid) {
      this.snackBarServ.displayCustomMsg('Please log in to rate this academy!');
    } else {
      this.newReview = {
        reviewer_timest: new Date(),
        reviewer_rating: this.isSelected,
      };
      //backend code here
      this.snackBarServ.displaySent();
    }
    this.disabletButton = true;
    this.isSelected = -1;
  }
  getDate() {
    return new Date();
  }
}
