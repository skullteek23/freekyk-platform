import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-season-property-line',
  templateUrl: './season-property-line.component.html',
  styleUrls: ['./season-property-line.component.scss']
})
export class SeasonPropertyLineComponent implements OnInit {

  @Input() label = null;
  @Input() value = null;
  @Input() showChip = false;
  @Input() selectedChip = false;
  @Input() showLink = false;

  constructor() { }

  ngOnInit(): void {
  }

}
