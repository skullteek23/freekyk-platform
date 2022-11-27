import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SnackbarService } from '@app/services/snackbar.service';
import { GroundBasicInfo, GroundMoreInfo, GroundPrivateInfo, IGroundInfo } from '@shared/interfaces/ground.model';
import { IFilter } from '@shared/interfaces/others.model';
import { ISelectMatchType } from '@shared/interfaces/season.model';
import { LocationService } from '@shared/services/location-cities.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { SeasonAdminService } from '../../../season-admin.service';

@Component({
  selector: 'app-select-ground',
  templateUrl: './select-ground.component.html',
  styleUrls: ['./select-ground.component.scss']
})
export class SelectGroundComponent implements OnInit, OnDestroy {

  @Input() stepper: MatHorizontalStepper;

  cities: string[] = [];
  groundForm: FormGroup;
  grounds: Partial<IGroundInfo>[] = [];
  groundsCache: Partial<IGroundInfo>[] = [];
  isLoaderShown = false;
  selectedCity = null;
  selectedTabIndex = 0;
  subscriptions = new Subscription();

  constructor(
    private locationService: LocationService,
    private snackBarService: SnackbarService,
    private ngFire: AngularFirestore,
    private seasonAdminService: SeasonAdminService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.initComponentValues();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initForm() {
    this.groundForm = new FormGroup({
      ownType: new FormControl(null, Validators.required)
    });
  }

  initComponentValues() {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(sessionStorage.getItem('selectMatchType'));
    if (selectMatchTypeFormData) {
      this.onSelectState(selectMatchTypeFormData.location?.state, selectMatchTypeFormData.location?.city);
    } else {
      this.snackBarService.displayError('Please finish previous steps!');
    }
  }

  onSelectState(state: string, city: string): void {
    if (state && city) {
      this.selectedCity = city;
      this.isLoaderShown = true;
      this.setLocation(state);
      this.onLoadTabs();
    }
  }

  setLocation(state: string) {
    this.locationService.getCityByState(state).subscribe(response => {
      this.cities = response as string[];
    });
  }

  getGrounds() {
    const groundType = this.selectedTabIndex === 0 ? 'PRIVATE' : 'PUBLIC';
    forkJoin([
      this.ngFire.collection('grounds', query => query.where('locCity', '==', this.selectedCity).where('ownType', '==', groundType)).get(),
      this.ngFire.collection('groundDetails').get(),
      this.ngFire.collection('groundsPvt').get()
    ])
      .subscribe({
        next: (response) => {
          if (response && response.length === 3) {
            this.parseGrounds(response);
          }
        },
        error: (err) => {
          this.isLoaderShown = false;
        }
      });
  }

  parseGrounds(response: any[]) {
    if (!response) {
      return;
    }
    this.grounds = [];
    this.groundsCache = [];
    const groundsList = (response[0]?.docs as any[])?.map(
      doc => ({ id: doc.id, ...doc.data() as GroundBasicInfo } as GroundBasicInfo)
    );
    const groundsMoreList = (response[1]?.docs as any[])?.map(
      doc => ({ id: doc.id, ...doc.data() as GroundMoreInfo } as GroundMoreInfo)
    );
    const groundPvtList = (response[2]?.docs as any[])?.map(
      doc => ({ id: doc.id, ...doc.data() as GroundPrivateInfo } as GroundPrivateInfo)
    );
    if (groundsList && groundsMoreList) {
      groundsList.forEach(ground => {
        if (ground && ground.id) {
          const moreData = groundsMoreList.find(el => el.id === ground.id);
          const data: Partial<IGroundInfo> = {};
          data.name = ground.name;
          data.imgpath = ground.imgpath;
          data.locCity = ground.locCity;
          data.locState = ground.locState;
          data.fieldType = ground.fieldType;
          data.ownType = ground.ownType;
          data.playLvl = ground.playLvl;
          data.id = ground.id;
          if (moreData) {
            data.referee = moreData.referee;
            data.foodBev = moreData.foodBev;
            data.parking = moreData.parking;
            data.goalpost = moreData.goalpost;
            data.washroom = moreData.washroom;
            data.staff = moreData.staff;
          }
          if (groundPvtList) {
            const timingData = groundPvtList.find(el => el.id === ground.id);
            data.timings = timingData.timings;
          }
          this.grounds.push(data);
        }
      });
      this.groundsCache = this.grounds;
    }
    this.isLoaderShown = false;
  }

  onLoadTabs() {
    this.getGrounds();
    this.groundForm.get('ownType').setValue(this.selectedTabIndex === 0 ? 'PRIVATE' : 'PUBLIC');
    this.seasonAdminService.resetSelectedGrounds();
  }

  onApplyFilter(appliedFilters: Partial<IFilter>) {
    if (this.selectedCity !== appliedFilters.city) {
      this.selectedCity = appliedFilters.city;
      this.onLoadTabs();
    }
    delete appliedFilters.city;
    if (Object.keys(appliedFilters).length) {
      this.grounds = this.groundsCache.filter(ground => !Object.keys(appliedFilters).some(key => ground[key] !== true));
    } else {
      this.grounds = this.groundsCache;
    }
  }

}
