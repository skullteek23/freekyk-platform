import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-line-info-display',
  templateUrl: './line-info-display.component.html',
  styleUrls: ['./line-info-display.component.css']
})
export class LineInfoDisplayComponent implements OnInit {

  @Input() heading = '';
  @Input() content = '';

  constructor() { }

  ngOnInit(): void {
  }

}
