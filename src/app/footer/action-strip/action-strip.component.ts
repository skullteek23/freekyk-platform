import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-strip',
  templateUrl: './action-strip.component.html',
  styleUrls: ['./action-strip.component.css'],
})
export class ActionStripComponent implements OnInit {
  // tslint:disable: no-input-rename
  @Input('compact') isCompact = false;
  @Input('heading') headingText = 'ready to play football?';
  constructor(private router: Router) {}
  ngOnInit(): void {}
  onNavigate(route: string): void {
    this.router.navigate([route]);
  }
}
