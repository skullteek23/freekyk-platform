import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LOREM_IPSUM_SHORT } from '../../Constants/WEBSITE_CONTENT';
import { heroCallToAction } from '../../interfaces/others.model';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent implements OnInit {
  @Input('headline') headline = false;
  @Input('overline') overline: string | false = 'Play';
  @Input('title') title: string | false = 'freekyk play';
  @Input('CTA') button: heroCallToAction | false = {
    name: 'get started',
    route: '/signup',
  };
  @Input('landingPage') largeBanner = false;
  @Input() imageSource: string;
  @Input() description: string = LOREM_IPSUM_SHORT;
  @Input() useAltLayout = false;
  constructor(private router: Router, private dialog: MatDialog) {}
  ngOnInit(): void {}
  onNavigate(nav: string): void {
    this.router.navigate([nav]);
  }
  isFloatText(): string {
    return this.useAltLayout ? 'absolute' : 'block';
  }
}
