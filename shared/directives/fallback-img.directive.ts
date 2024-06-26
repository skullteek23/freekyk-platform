import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { ProfileConstants } from '@shared/constants/constants';

@Directive({
  selector: '[appFallbackImg]'
})
export class FallbackImgDirective implements OnDestroy {

  @Input() imgSrc: string = ProfileConstants.FALLBACK_IMG_URL;

  constructor(private el: ElementRef) {
    el?.nativeElement?.addEventListener('error', this.onError.bind(this))
  }

  private onError() {
    this.el?.nativeElement?.setAttribute('src', this.imgSrc);
  }

  private removeEvents() {
    this.el?.nativeElement?.removeEventListener('error', this.onError);
  }

  ngOnDestroy() {
    this.removeEvents();
  }

}
