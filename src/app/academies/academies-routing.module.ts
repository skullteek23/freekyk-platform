import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcademiesComponent } from './academies.component';
import { AcademyProfileComponent } from './profile-pages/academy-profile/academy-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AcademiesComponent,
    children: [
      { path: 'academy/:academyid', component: AcademyProfileComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcademiesRoutingModule {}
