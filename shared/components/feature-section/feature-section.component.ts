import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface IFeatureSectionData {
  title: string;
  imgUrl: string;
  subtitle: string;
  content: string;
  cta: {
    label: string;
    route: string
  };
}

@Component({
  selector: 'app-feature-section',
  templateUrl: './feature-section.component.html',
  styleUrls: ['./feature-section.component.scss'],
})
export class FeatureSectionComponent implements OnInit {
  @Input() data: IFeatureSectionData = null;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void { }

  onNavigate(): void {
    if (this.data.cta?.route) {
      this.router.navigate([this.data.cta.route]);
    }
  }
}
