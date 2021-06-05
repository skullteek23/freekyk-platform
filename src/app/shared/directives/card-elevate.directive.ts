import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCardElevate]',
})
export class CardElevateDirective {
  @HostListener('mouseover', ['$event'])
  elevate() {
    this.renderer.addClass(this.elRef.nativeElement, 'mat-elevation-z8');
  }
  @HostListener('mouseleave', ['$event'])
  removeElevate() {
    this.renderer.removeClass(this.elRef.nativeElement, 'mat-elevation-z8');
  }
  constructor(private renderer: Renderer2, private elRef: ElementRef) {}
}
