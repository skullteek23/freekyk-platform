import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateSeasonComponent } from '../create-season/create-season.component';

@Component({
  selector: 'app-create-season-container',
  templateUrl: './create-season-container.component.html',
  styleUrls: ['./create-season-container.component.css']
})
export class CreateSeasonContainerComponent implements OnInit {

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.dialog.open(CreateSeasonComponent, {
      panelClass: 'extra-large-dialogs',
      disableClose: true,
      data: params
    })
  }
}
