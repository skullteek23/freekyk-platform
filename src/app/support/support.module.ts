import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from './support.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FaqsComponent } from './faqs/faqs.component';
import { MaterialModule } from '@shared/material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AccTicketsComponent } from '@app/support/acc-tickets/acc-tickets.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', component: SupportComponent,
    children: [
      { path: 'faqs', component: FaqsComponent },
      { path: 'tickets', component: AccTicketsComponent },
      // { path: 'tickets/open', component: AccTicketsComponent },
    ]
  },
]

@NgModule({
  declarations: [SupportComponent, FaqsComponent, AccTicketsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule
  ],
})
export class SupportModule { }
