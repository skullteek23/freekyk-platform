import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FreestyleComponent } from './freestyle.component';
import { FsHomeComponent } from './fs-home/fs-home.component';

const routes: Routes = [
  {
    path: '',
    component: FreestyleComponent,
    children: [{ path: 'home', component: FsHomeComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FreestyleRoutingModule {}
