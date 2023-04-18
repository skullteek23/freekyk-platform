import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-quantity',
  templateUrl: './select-quantity.component.html',
  styleUrls: ['./select-quantity.component.scss']
})
export class SelectQuantityComponent implements OnInit {

  quantity: number = 1;

  constructor(
    public dialogRef: MatDialogRef<SelectQuantityComponent>,
  ) { }

  ngOnInit(): void {
    this.onCloseDialog();
  }

  onCloseDialog(): void {
    this.dialogRef.close(this.quantity);
  }

}
