import { Component, OnInit } from '@angular/core';
import { profile } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  prateek: profile;
  ankit: profile;
  constructor() {}

  ngOnInit(): void {
    this.prateek = {
      name: 'Prateek Goel',
      designation: 'Software Developer & Co-Founder',
      links: {
        linkedin: 'https://www.linkedin.com/in/prateekgoel23/',
        facebook: 'https://www.facebook.com/skullteek023/',
        instagram: 'https://www.instagram.com/skullteek23/',
        twitter: 'https://twitter.com/Hrdcre_Gamer023',
      },
      imgpath:
        'https://firebasestorage.googleapis.com/v0/b/football-platform-v1.appspot.com/o/Freekyk_Team%20(2).jpg?alt=media&token=0968c838-7119-4372-be63-3ab9bf898fbb',
    };
    this.ankit = {
      name: 'Ankit Singh',
      designation: 'CEO & Founder',
      links: {
        linkedin: 'https://www.linkedin.com/in/singhankit91/',
        facebook: 'https://www.facebook.com/ankitsingh1540',
        instagram: 'https://www.instagram.com/ankit.singh.0.123/',
      },
      imgpath:
        'https://firebasestorage.googleapis.com/v0/b/football-platform-v1.appspot.com/o/Freekyk_Team%20(1).JPG?alt=media&token=fb7a4acf-0856-46f4-a905-001c51ec0d6d',
    };
  }
}
