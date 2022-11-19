import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-select-ground',
  templateUrl: './select-ground.component.html',
  styleUrls: ['./select-ground.component.scss']
})
export class SelectGroundComponent implements OnInit {

  @Input() stepper: MatHorizontalStepper;

  groundForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.groundForm = new FormGroup({
      groundType: new FormControl(null, Validators.required)
    });
  }

}
