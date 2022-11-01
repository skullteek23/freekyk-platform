import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from './support.component';
import { SharedModule } from '@shared/shared.module';
import { SupportRoutingModule } from './support-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FaqsComponent } from './faqs/faqs.component';
import { MaterialModule } from '@shared/material.module';

@NgModule({
  declarations: [SupportComponent, FaqsComponent],
  imports: [CommonModule, SharedModule, SupportRoutingModule, ReactiveFormsModule,
    MaterialModule],
})
export class SupportModule { }
