import { Component, OnInit, Input } from '@angular/core';
import { CommunityNumbersContent } from '../../interfaces/others.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-numbers-section',
  templateUrl: './community-numbers-section.component.html',
  styleUrls: ['./community-numbers-section.component.scss'],
})
export class CommunityNumbersSectionComponent implements OnInit {

  @Input() content: CommunityNumbersContent = {
    heading: '',
    desc: '',
    numbers: {},
  };

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void { }

  onNavigate() {
    this.router.navigate(['/signup']);
  }
}
