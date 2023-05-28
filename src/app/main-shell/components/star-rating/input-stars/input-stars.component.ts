import { AfterViewInit, Component, ElementRef, Input, Renderer2, forwardRef } from '@angular/core';
import { BaseControlValueAccessor } from '../BaseControlValueAccessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProfileConstants } from '@shared/constants/constants';

@Component({
  selector: 'app-input-stars',
  templateUrl: './input-stars.component.html',
  styleUrls: ['./input-stars.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputStarsComponent),
      multi: true,
    },
  ],
})
export class InputStarsComponent extends BaseControlValueAccessor<any> implements AfterViewInit {
  @Input() stars = ProfileConstants.RATING_NUMBERS;;
  @Input() value: number = null; // un-touched value should be null
  disabled: boolean;

  constructor(
    private eRef: ElementRef,
    private renderer: Renderer2
  ) {
    super();
  }

  writeValue(val) {
    this.value = val;
    super.writeValue(this.value);
  }

  setRating(rating) {
    if (this.disabled) {
      return;
    }
    // stars & messages arrays are 0 based
    let oldVal = rating;
    this.value = oldVal + 1;

    // set the value for the control
    this.onChange(this.value);
    this.onTouched();

    // SVG STAR & DOM STUFF
    const svgs = this.eRef.nativeElement.querySelectorAll('svg.star');

    for (let i = 0, j = svgs.length; i < j; i++) {
      if (i <= rating) {
        this.renderer.addClass(svgs[i], 'active');
      } else {
        this.renderer.removeClass(svgs[i], 'active');
      }
    }
  }

  // if there's a value on init we need to apply it to the stars programmatically
  // eRef has no DOM on init. We need to work with our view within AfterViewInit
  ngAfterViewInit() {
    if (this.value !== null) {
      let initialValue = this.value;
      this.setRating(--initialValue);
    }
  }
}
