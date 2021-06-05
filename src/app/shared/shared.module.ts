import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { IllustrationHeroSectionComponent } from './components/illustration-hero-section/illustration-hero-section.component';
import { WhyChooseSectionComponent } from './components/why-choose-section/why-choose-section.component';
import { FeatureSectionComponent } from './components/feature-section/feature-section.component';
import { FeatureInfoComponent } from './dialogs/feature-info/feature-info.component';
import { CovidSectionComponent } from './components/covid-section/covid-section.component';
import { CommunityNumbersSectionComponent } from './components/community-numbers-section/community-numbers-section.component';
import { ActionStripComponent } from '../footer/action-strip/action-strip.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { SharedMaterialModule } from './shared-material.module';
import { FiltersLgComponent } from './components/filters-lg/filters-lg.component';
import { FiltersSmComponent } from './components/filters-sm/filters-sm.component';
import { FilterDialogComponent } from './dialogs/filter-dialog/filter-dialog.component';
import { CardElevateDirective } from './directives/card-elevate.directive';
import { StickyNavDirective } from './directives/sticky-nav.directive';
import { CardLoadingShimmerComponent } from './components/card-loading-shimmer/card-loading-shimmer.component';
import { NoItemsMessageComponent } from './components/no-items-message/no-items-message.component';
import { FixtureBasicComponent } from './components/fixture-basic/fixture-basic.component';
import { BarLoadingShimmerComponent } from './components/bar-loading-shimmer/bar-loading-shimmer.component';
import { MatchCardComponent } from './dialogs/match-card/match-card.component';
import { ContestInfoComponent } from './dialogs/contest-info/contest-info.component';
import { PricingTemplateComponent } from './components/pricing-template/pricing-template.component';
import { TeamCommsMobileComponent } from './components/team-comms-mobile/team-comms-mobile.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UpdateInfoComponent } from './components/update-info/update-info.component';
import { ContestMobileComponent } from './components/contest-mobile/contest-mobile.component';
import { JourneyMobileComponent } from './components/journey-mobile/journey-mobile.component';
import { TrickBoxComponent } from './components/trick-box/trick-box.component';
import { ExitDashboardComponent } from './components/exit-dashboard/exit-dashboard.component';
import { NamePositionComboPipe } from './pipes/name-position-combo.pipe';
import { NameComboPipe } from './pipes/name-combo.pipe';
import { LoadingComponent } from './components/loading/loading.component';
import { PlayerCardComponent } from './dialogs/player-card/player-card.component';
import { FreestylerCardComponent } from './dialogs/freestyler-card/freestyler-card.component';
import { MatchDetailHeaderComponent } from './components/match-detail-header/match-detail-header.component';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { TickAnimationComponent } from './components/tick-animation/tick-animation.component';
import { TextShortenPipe } from './pipes/text-shorten.pipe';
import { SocialMediaLinksComponent } from './components/social-media-links/social-media-links.component';
import { EnlargeMediaComponent } from './dialogs/enlarge-media/enlarge-media.component';
import { AboutProfileCardComponent } from './components/about-profile-card/about-profile-card.component';
import { SharesheetmobileComponent } from './components/sharesheetmobile/sharesheetmobile.component';
import { SharesheetComponent } from './components/sharesheet/sharesheet.component';
import { ShareButtonsConfig, ShareModule } from 'ngx-sharebuttons';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { WeightPipe } from './pipes/weight.pipe';
import { StrongFootPipe } from './pipes/strong-foot.pipe';
import { HeightPipe } from './pipes/height.pipe';
import { GenderPipe } from './pipes/gender.pipe';
import { ContactNumberPipe } from './pipes/contact-number.pipe';
import { JerseyPipe } from './pipes/jersey.pipe';
import { BioPipe } from './pipes/bio.pipe';
import { ProfilePicPipe } from './pipes/profile-pic.pipe';
import { ConfirmationBoxComponent } from './dialogs/confirmation-box/confirmation-box.component';
const customConfig: ShareButtonsConfig = {
  include: ['facebook', 'twitter', 'google'],
  exclude: ['tumblr', 'stumble', 'vk'],
  theme: 'modern-light',
  gaTracking: true,
  twitterAccount: 'twitterUsername',
  autoSetMeta: true,
};
@NgModule({
  declarations: [
    ActionStripComponent,
    HeroSectionComponent,
    IllustrationHeroSectionComponent,
    WhyChooseSectionComponent,
    FeatureSectionComponent,
    FeatureInfoComponent,
    CovidSectionComponent,
    CommunityNumbersSectionComponent,
    FiltersLgComponent,
    FiltersSmComponent,
    FilterDialogComponent,
    CardElevateDirective,
    StickyNavDirective,
    CardLoadingShimmerComponent,
    NoItemsMessageComponent,
    FixtureBasicComponent,
    BarLoadingShimmerComponent,
    MatchCardComponent,
    ContestInfoComponent,
    PricingTemplateComponent,
    TeamCommsMobileComponent,
    UpdateInfoComponent,
    ContestMobileComponent,
    JourneyMobileComponent,
    TrickBoxComponent,
    ExitDashboardComponent,
    NamePositionComboPipe,
    NameComboPipe,
    LoadingComponent,
    PlayerCardComponent,
    FreestylerCardComponent,
    MatchDetailHeaderComponent,
    TickAnimationComponent,
    TextShortenPipe,
    SocialMediaLinksComponent,
    EnlargeMediaComponent,
    AboutProfileCardComponent,
    SharesheetmobileComponent,
    SharesheetComponent,
    WeightPipe,
    StrongFootPipe,
    HeightPipe,
    GenderPipe,
    ContactNumberPipe,
    JerseyPipe,
    BioPipe,
    ProfilePicPipe,
    ConfirmationBoxComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    YouTubePlayerModule,
    ShareModule.withConfig(customConfig),
    ClipboardModule,
  ],
  exports: [
    CommonModule,
    HeroSectionComponent,
    IllustrationHeroSectionComponent,
    WhyChooseSectionComponent,
    FeatureSectionComponent,
    FeatureInfoComponent,
    CovidSectionComponent,
    CommunityNumbersSectionComponent,
    ActionStripComponent,
    SharedMaterialModule,
    FlexLayoutModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    FiltersLgComponent,
    FiltersSmComponent,
    CardElevateDirective,
    StickyNavDirective,
    CardLoadingShimmerComponent,
    NoItemsMessageComponent,
    FixtureBasicComponent,
    BarLoadingShimmerComponent,
    MatchCardComponent,
    ContestInfoComponent,
    PricingTemplateComponent,
    NamePositionComboPipe,
    NameComboPipe,
    TeamCommsMobileComponent,
    UpdateInfoComponent,
    ContestMobileComponent,
    JourneyMobileComponent,
    TrickBoxComponent,
    ExitDashboardComponent,
    NamePositionComboPipe,
    NameComboPipe,
    LoadingComponent,
    MatchDetailHeaderComponent,
    PlayerCardComponent,
    FreestylerCardComponent,
    YouTubePlayerModule,
    MatchDetailHeaderComponent,
    TickAnimationComponent,
    TextShortenPipe,
    SocialMediaLinksComponent,
    EnlargeMediaComponent,
    AboutProfileCardComponent,
    SharesheetmobileComponent,
    SharesheetComponent,
    WeightPipe,
    StrongFootPipe,
    HeightPipe,
    GenderPipe,
    ContactNumberPipe,
    JerseyPipe,
    BioPipe,
    ProfilePicPipe,
  ],
})
export class SharedModule {}
