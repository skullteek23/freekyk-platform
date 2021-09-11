import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

const routes = [];
//   {
//     path: '',
//     component: AdminComponent,
//     children: [
//       { path: 'home', component: AdminHomeComponent },
//       {
//         path: 'seasons',
//         component: SeasonPanelComponent,
//         children: [
//           { path: 'add', component: AddSeasonComponent },
//           { path: 'view', component: ViewSeasonComponent },
//           { path: 'update', component: UpdateMrComponent },
//           { path: 'generate', component: GenFixturesComponent },
//         ],
//       },
//       { path: 'grounds', component: GroundsPanelComponent },
//       { path: 'players', component: PlayersPanelComponent },
//       { path: 'freestylers', component: FreestylersPanelComponent },
//       { path: 'tickets', component: TicketsPanelComponent },
//       { path: 'teams', component: TeamsPanelComponent },
//       { path: 'academies', component: AcademiesPanelComponent },
//       {
//         path: 'equipment',
//         component: EquipmentPanelComponent,
//         children: [
//           { path: 'add', component: AddProductComponent },
//           { path: 'register-seller', component: RegiSellerComponent },
//           { path: 'add-coupon', component: AddCouponComponent },
//         ],
//       },
//       { path: 'contests', component: ContestPanelComponent },
//     ],
//   },
// ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
