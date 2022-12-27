import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademiesComponent } from './academies.component';
import { AcademiesRoutingModule } from './academies-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AcademiesMaterialModule } from './academies-material.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [AcademiesComponent],
  imports: [
    CommonModule,
    AcademiesRoutingModule,
    ReactiveFormsModule,
    AcademiesMaterialModule,
    SharedModule,
  ],
  exports: [],
})
export class AcademiesModule { }
