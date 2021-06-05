import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademiesComponent } from './academies.component';
import { AcademiesRoutingModule } from './academies-routing.module';
import { AcademyProfileComponent } from './profile-pages/academy-profile/academy-profile.component';
import { AcBatchesComponent } from './profile-pages/academy-profile/ac-batches/ac-batches.component';
import { AcGalleryComponent } from './profile-pages/academy-profile/ac-gallery/ac-gallery.component';
import { AcOverviewComponent } from './profile-pages/academy-profile/ac-overview/ac-overview.component';
import { AcReviewsComponent } from './profile-pages/academy-profile/ac-reviews/ac-reviews.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AcademiesMaterialModule } from './academies-material.module';
import { AcadRegisterDialogComponent } from './dialogs/acad-register-dialog/acad-register-dialog.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AcademiesComponent,
    AcademyProfileComponent,
    AcBatchesComponent,
    AcGalleryComponent,
    AcOverviewComponent,
    AcReviewsComponent,
    AcadRegisterDialogComponent,
  ],
  imports: [
    CommonModule,
    AcademiesRoutingModule,
    ReactiveFormsModule,
    AcademiesMaterialModule,
    SharedModule,
  ],
  exports: [],
})
export class AcademiesModule {}
