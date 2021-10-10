import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcademiesComponent } from './academies.component';

const routes: Routes = [
  {
    path: '',
    component: AcademiesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcademiesRoutingModule {}
