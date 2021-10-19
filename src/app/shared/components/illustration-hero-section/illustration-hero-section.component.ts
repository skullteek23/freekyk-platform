import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-illustration-hero-section',
  templateUrl: './illustration-hero-section.component.html',
  styleUrls: ['./illustration-hero-section.component.css'],
})
export class IllustrationHeroSectionComponent implements OnInit {
  @Input() svgSrc: string;
  constructor() {}

  ngOnInit(): void {}
}
