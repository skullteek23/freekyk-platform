import { Component, Input, OnInit } from '@angular/core';
import { LOREM_IPSUM_VERY_SHORT } from '../../Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-why-choose-section',
  templateUrl: './why-choose-section.component.html',
  styleUrls: ['./why-choose-section.component.css'],
})
export class WhyChooseSectionComponent implements OnInit {
  @Input('videoEditing') isVeSteps: boolean = false;
  @Input('name') serviceName: string = '';
  @Input() content: { subHeading: string; listPoints: string[] } = {
    subHeading: LOREM_IPSUM_VERY_SHORT,
    listPoints: [
      LOREM_IPSUM_VERY_SHORT,
      LOREM_IPSUM_VERY_SHORT,
      LOREM_IPSUM_VERY_SHORT,
      LOREM_IPSUM_VERY_SHORT,
    ],
  };
  constructor() {}

  ngOnInit(): void {}
}
