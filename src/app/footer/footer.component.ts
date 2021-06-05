import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  products_links = [
    { name: 'play', route: 'play/home' },
    { name: 'freestyle', route: 'freestyle/home' },
    { name: 'academies', route: 'academies' },
    { name: 'equipment', route: 'equipment' },
    { name: 'video editing', route: 'veservices' },
  ];
  about_links = [
    { name: 'about us', route: 'about' },
    { name: 'raise a ticket', route: 'support' },
    { name: 'help & support', route: 'support' },
  ];
}
