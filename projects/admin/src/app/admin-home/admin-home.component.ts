import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css'],
})
export class AdminHomeComponent implements OnInit {
  links: any[] = [
    { name: 'seasons', route: 'seasons' },
    // { name: 'grounds', route: 'grounds' }
  ];
  activeLink = 'seasons';
  constructor() {
  }
  ngOnInit(): void { }
}
