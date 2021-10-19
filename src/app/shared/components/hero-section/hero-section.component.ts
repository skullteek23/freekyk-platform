import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { heroCallToAction } from '../../interfaces/others.model';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
})
export class HeroSectionComponent implements OnInit {
  @Input('headline') headline: boolean = false;
  @Input('overline') overline: string | false = 'Play';
  @Input('title') title: string | false = 'freekyk play';
  @Input('CTA') button: heroCallToAction | false = {
    name: 'get started',
    route: '/signup',
  };
  @Input('landingPage') largeBanner: boolean = false;
  @Input() imageSource: string;
  @Input() description: string;
  constructor(private router: Router, private dialog: MatDialog) {}
  ngOnInit(): void {}
  onNavigate(nav: string) {
    this.router.navigate([nav]);
  }
}
