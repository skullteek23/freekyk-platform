import { Component, Output } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tick-animation',
  templateUrl: './tick-animation.component.html',
  styleUrls: ['./tick-animation.component.scss']
})
export class TickAnimationComponent {
  @Output() finishAnimation = new Subject<void>();

  endAnimation() {
    setTimeout(() => {
      this.finishAnimation.next();
    }, 2000);
  }
}
