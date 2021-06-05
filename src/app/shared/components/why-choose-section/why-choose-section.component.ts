import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-why-choose-section',
  templateUrl: './why-choose-section.component.html',
  styleUrls: ['./why-choose-section.component.css']
})
export class WhyChooseSectionComponent implements OnInit {
  @Input('videoEditing') isVeSteps: boolean = false;
  @Input('name') serviceName: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
