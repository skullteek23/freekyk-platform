import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from './support.component';
import { SharedModule } from '../shared/shared.module';
import { SupportRoutingModule } from './support-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FaqsComponent } from './faqs/faqs.component';

@NgModule({
  declarations: [SupportComponent, FaqsComponent],
  imports: [SharedModule, SupportRoutingModule, ReactiveFormsModule],
})
export class SupportModule {}
