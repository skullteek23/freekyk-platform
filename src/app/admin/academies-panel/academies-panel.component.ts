import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-academies-panel',
  templateUrl: './academies-panel.component.html',
  styleUrls: ['./academies-panel.component.css'],
})
export class AcademiesPanelComponent implements OnInit {
  completed = false;
  constructor(private ngFire: AngularFirestore) {}

  ngOnInit(): void {}
  onAddAcademies() {
    var batch = this.ngFire.firestore.batch();
    var academiesProfile = this.getBasicAcadProfiles();
    // var academiesMoreInfo = this.get();
  }
  getBasicAcadProfiles() {}
  onOpenAcademyForm() {}
}
