import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-line-info-display',
  templateUrl: './line-info-display.component.html',
  styleUrls: ['./line-info-display.component.css']
})
export class LineInfoDisplayComponent {

  @Input() heading = '';
  @Input() content = '';

}
