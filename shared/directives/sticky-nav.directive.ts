import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appStickyNav]',
})
export class StickyNavDirective {

  @Input() offset = 112;
  @Input() panelClass = '';

  @HostListener('window:scroll', ['$event'])
  addSticky(): void {
    if (window.pageYOffset >= this.offset) {
      this.renderer.addClass(this.elRef.nativeElement, this.panelClass);
      this.renderer.addClass(this.elRef.nativeElement, 'mat-elevation-z4');
    } else {
      this.renderer.removeClass(this.elRef.nativeElement, this.panelClass);
      this.renderer.removeClass(this.elRef.nativeElement, 'mat-elevation-z4');
    }
  }
  constructor(private renderer: Renderer2, private elRef: ElementRef) { }
}
