import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-illustration-hero-section-alternate',
  templateUrl: './illustration-hero-section-alternate.component.html',
  styleUrls: ['./illustration-hero-section-alternate.component.css'],
})
export class IllustrationHeroSectionAlternateComponent implements OnInit {
  @Input() svgSrc: string;
  constructor() { }

  ngOnInit(): void { }
  checkSvg(): boolean {
    // console.log(this.svgSrc.includes('equipment'));
    return this.svgSrc.includes('academy') || this.svgSrc.includes('equipment');
  }
}
