import { Component, Input, OnInit } from '@angular/core';
import { LOREM_IPSUM_VERY_SHORT } from '../../web-content/WEBSITE_CONTENT';

export interface IPointersComponentData {
  heading: string;
  description: string;
  listPoints?: IPointersComponentData[];
}

@Component({
  selector: 'app-why-choose-section',
  templateUrl: './why-choose-section.component.html',
  styleUrls: ['./why-choose-section.component.scss'],
})
export class WhyChooseSectionComponent implements OnInit {
  @Input() content: IPointersComponentData = null;

  constructor() { }

  ngOnInit(): void { }
}
