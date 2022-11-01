import { ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { IllustrationHeroSectionComponent } from './components/illustration-hero-section/illustration-hero-section.component';
import { WhyChooseSectionComponent } from './components/why-choose-section/why-choose-section.component';
import { FeatureSectionComponent } from './components/feature-section/feature-section.component';
import { FeatureInfoComponent } from './dialogs/feature-info/feature-info.component';
import { CovidSectionComponent } from './components/covid-section/covid-section.component';
import { CommunityNumbersSectionComponent } from './components/community-numbers-section/community-numbers-section.component';
import { MaterialModule } from './material.module';
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
import { TeamCommsMobileComponent } from './components/team-comms-mobile/team-comms-mobile.component';
import { UpdateInfoComponent } from './components/update-info/update-info.component';
import { ContestMobileComponent } from './components/contest-mobile/contest-mobile.component';
import { JourneyMobileComponent } from './components/journey-mobile/journey-mobile.component';
import { TrickBoxComponent } from './components/trick-box/trick-box.component';
import { ExitDashboardComponent } from './components/exit-dashboard/exit-dashboard.component';
import { NamePositionComboPipe } from './pipes/name-position-combo.pipe';
import { NameComboPipe } from './pipes/name-combo.pipe';
import { LoadingComponent } from './components/loading/loading.component';
import { PlayerCardComponent } from './dialogs/player-card/player-card.component';
import { MatchDetailHeaderComponent } from './components/match-detail-header/match-detail-header.component';
import { TickAnimationComponent } from './components/tick-animation/tick-animation.component';
import { TextShortenPipe } from './pipes/text-shorten.pipe';
import { SocialMediaLinksComponent } from './components/social-media-links/social-media-links.component';
import { EnlargeMediaComponent } from './dialogs/enlarge-media/enlarge-media.component';
import { AboutProfileCardComponent } from './components/about-profile-card/about-profile-card.component';
import { SharesheetmobileComponent } from './components/sharesheetmobile/sharesheetmobile.component';
import { SharesheetComponent } from './components/sharesheet/sharesheet.component';
import { ShareButtonsConfig, ShareModule } from 'ngx-sharebuttons';
import { WeightPipe } from './pipes/weight.pipe';
import { StrongFootPipe } from './pipes/strong-foot.pipe';
import { HeightPipe } from './pipes/height.pipe';
import { GenderPipe } from './pipes/gender.pipe';
import { ContactNumberPipe } from './pipes/contact-number.pipe';
import { JerseyPipe } from './pipes/jersey.pipe';
import { BioPipe } from './pipes/bio.pipe';
import { ProfilePicPipe } from './pipes/profile-pic.pipe';
import { ConfirmationBoxComponent } from './dialogs/confirmation-box/confirmation-box.component';
import { SearchLgComponent } from './components/search-lg/search-lg.component';
import { FilterListPipe } from './pipes/filter-list.pipe';
import { AccountAvatarComponent } from './components/account-avatar/account-avatar.component';
import { SearchAutocompleteComponent } from './components/search-autocomplete/search-autocomplete.component';
import {
  IllustrationHeroSectionAlternateComponent
} from './components/illustration-hero-section-alternate/illustration-hero-section-alternate.component';
import { PhotoUploaderComponent } from './components/photo-uploader/photo-uploader.component';
import { FileUploaderComponent } from './components/file-uploader/file-uploader.component';
import { NumberToAMPMPipe } from './pipes/number-to-ampm.pipe';
import { ActionStripComponent } from './components/action-strip/action-strip.component';

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
    SearchLgComponent,
    FilterListPipe,
    AccountAvatarComponent,
    IllustrationHeroSectionAlternateComponent,
    SearchAutocompleteComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    NumberToAMPMPipe,
    ActionStripComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    YouTubePlayerModule,
    ShareModule.withConfig(customConfig),
    ClipboardModule,
  ],
  exports: [
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
    MatchDetailHeaderComponent,
    TickAnimationComponent,
    TextShortenPipe,
    SocialMediaLinksComponent,
    EnlargeMediaComponent,
    AboutProfileCardComponent,
    SharesheetmobileComponent,
    SharesheetComponent,
    WeightPipe,
    NumberToAMPMPipe,
    StrongFootPipe,
    HeightPipe,
    GenderPipe,
    ContactNumberPipe,
    JerseyPipe,
    BioPipe,
    ProfilePicPipe,
    ConfirmationBoxComponent,
    SearchLgComponent,
    FilterListPipe,
    AccountAvatarComponent,
    IllustrationHeroSectionAlternateComponent,
    SearchAutocompleteComponent,
    PhotoUploaderComponent,
    FileUploaderComponent,
    ActionStripComponent,
  ],
})
export class SharedModule { }