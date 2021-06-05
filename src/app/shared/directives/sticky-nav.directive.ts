import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStickyNav]',
})
export class StickyNavDirective {
  @HostListener('window:scroll', ['$event'])
  addSticky() {
    if (window.pageYOffset >= 112) {
      this.renderer.addClass(this.elRef.nativeElement, 'sticky');
      this.renderer.addClass(this.elRef.nativeElement, 'mat-elevation-z4');
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, 'sticky');
      this.renderer.removeClass(this.elRef.nativeElement, 'mat-elevation-z4');
    }
  }
  constructor(private renderer: Renderer2, private elRef: ElementRef) {}
}
