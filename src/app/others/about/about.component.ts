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
        'https://firebasestorage.googleapis.com/v0/b/freekyk8.appspot.com/o/IMG_20191115_141200%20(1).jpg?alt=media&token=cf08c96f-f997-4095-ac0b-08d68e16bb40',
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
        'https://firebasestorage.googleapis.com/v0/b/freekyk8.appspot.com/o/My%20Photo(1).JPG?alt=media&token=7235ea66-9288-417b-b962-b25f5dba70fb',
    };
  }
}
