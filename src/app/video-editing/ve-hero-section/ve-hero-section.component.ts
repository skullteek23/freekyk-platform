import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { VeProjectComponent } from '../dialogs/ve-project/ve-project.component';

@Component({
  selector: 'app-ve-hero-section',
  templateUrl: './ve-hero-section.component.html',
  styleUrls: ['./ve-hero-section.component.css'],
})
export class VeHeroSectionComponent implements OnInit {
  constructor(private router: Router, private dialog: MatDialog) {}
  ngOnInit(): void {}

  onOpenForm() {
    this.dialog.open(VeProjectComponent, {
      panelClass: 'large-dialogs',
    });
  }
}
