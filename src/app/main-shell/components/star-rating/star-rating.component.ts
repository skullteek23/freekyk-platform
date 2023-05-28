import { Component, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent {

  @Output() ratingChange = new Subject<number>();
  @Input() set selectedRating(value: number) {
    this.initForm(value);
    this.addEventListener();
  }

  form: FormGroup;

  constructor() { }

  initForm(value: number): void {
    this.form = new FormGroup({
      rating: new FormControl(value)
    });
  }

  addEventListener() {
    if (this.form) {
      this.form.valueChanges.subscribe(data => {
        this.ratingChange.next(Number(data.rating));
      });
    }
  }
}
