import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';
import { BrandCollabInfo } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-da-fs-collabs',
  templateUrl: './da-fs-collabs.component.html',
  styleUrls: ['./da-fs-collabs.component.css'],
})
export class DaFsCollabsComponent implements OnInit {
  brandCollabs$: Observable<BrandCollabInfo[]>;

  constructor(private plServ: PlayerService) {
    const uid = localStorage.getItem('uid');
    this.brandCollabs$ = plServ
      .fetchFsStats(uid)
      .pipe(map((resp) => resp.br_colb));

    // .pipe(
    // map((resp) => {
    //   console.log(resp.br_colb);
    //   return resp.br_colb;
    // })
    // );
  }
  ngOnInit() {}
}
