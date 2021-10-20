import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-why-choose-section',
  templateUrl: './why-choose-section.component.html',
  styleUrls: ['./why-choose-section.component.css'],
})
export class WhyChooseSectionComponent implements OnInit {
  @Input('videoEditing') isVeSteps: boolean = false;
  @Input('name') serviceName: string = '';
  @Input() content: { subHeading: string; listPoints: string[] } = {
    subHeading: 'Heading',
    listPoints: ['Point 1', 'Point 2', 'Point 3', 'Point 4'],
  };
  constructor() {}

  ngOnInit(): void {}
}
