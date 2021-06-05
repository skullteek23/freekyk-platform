import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-acad-register-dialog',
  templateUrl: './acad-register-dialog.component.html',
  styleUrls: ['./acad-register-dialog.component.css'],
})
export class AcadRegisterDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<AcadRegisterDialogComponent>) {}
  acadRegiForm: FormGroup = new FormGroup({});
  onCloseDialog(msg: string) {
    this.dialogRef.close(msg);
  }
  ngOnInit(): void {
    this.acadRegiForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, Validators.required),
      phno: new FormControl(null, Validators.required),
      addt_info: new FormControl(null),
    });
  }
  onBookNow() {
    // backend code here
    this.onCloseDialog('success');
  }
}
