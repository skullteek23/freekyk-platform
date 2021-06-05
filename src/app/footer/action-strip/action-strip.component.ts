import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-action-strip',
  templateUrl: './action-strip.component.html',
  styleUrls: ['./action-strip.component.css'],
})
export class ActionStripComponent implements OnInit {
  @Input('compact') isCompact: boolean = false;
  @Input('heading') hText: string = 'ready to play football?';
  constructor(private router: Router) {}
  ngOnInit(): void {}
  onNavigate(route: string) {
    this.router.navigate([route]);
  }
}
