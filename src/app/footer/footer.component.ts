import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  productLinks = [
    { name: 'play', route: 'play/home' },
    { name: 'freestyle', route: 'freestyle/home' },
    { name: 'academies', route: 'academies' },
    { name: 'equipment', route: 'equipment' },
  ];
  aboutLinks = [
    { name: 'about us', route: 'about' },
    { name: 'raise a ticket', route: 'support' },
    { name: 'help & support', route: 'support' },
  ];
  constructor() {}
  ngOnInit(): void {}
}
